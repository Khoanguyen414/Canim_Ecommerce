package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.Entity.Inventory;
import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.dto.request.ProductRequest;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import com.example.canim_ecommerce.exception.CustomException;
import com.example.canim_ecommerce.mapper.ProductMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;
import com.example.canim_ecommerce.repository.InventoryRepository;
import com.example.canim_ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired private ProductRepository productRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private InventoryRepository inventoryRepo;
    @Autowired private ProductMapper mapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAll(Pageable pageable) {
        return productRepo.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getByCategory(Integer categoryId) {
        return productRepo.findByCategoryId(categoryId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepo.existsBySku(request.getSku())) {
            throw new CustomException("SKU đã tồn tại");
        }

        Product entity = mapper.toEntity(request);
        if (request.getCategoryId() != null) {
            Category cat = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new CustomException("Danh mục không tồn tại"));
            entity.setCategory(cat);
        }
        if (request.getStatus() != null) {
            entity.setStatus(Product.Status.valueOf(request.getStatus().toUpperCase()));
        }

        productRepo.save(entity);

        Inventory inv = new Inventory();
        inv.setProduct(entity);
        inv.setSku(request.getSku());
        inv.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        inventoryRepo.save(inv);

        ProductResponse resp = mapper.toResponse(entity);
        resp.setQuantity(inv.getQuantity());
        return resp;
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product entity = productRepo.findById(id)
                .orElseThrow(() -> new CustomException("Sản phẩm không tồn tại"));

        entity.setName(request.getName());
        entity.setSlug(request.getSlug());
        entity.setShortDescription(request.getShortDescription());
        entity.setLongDescription(request.getLongDescription());
        entity.setPrice(request.getPrice());
        entity.setBrand(request.getBrand());

        if (request.getStatus() != null) {
            entity.setStatus(Product.Status.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getCategoryId() != null) {
            Category cat = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new CustomException("Danh mục không tồn tại"));
            entity.setCategory(cat);
        }

        productRepo.save(entity);

        if (request.getQuantity() != null) {
            Inventory inv = inventoryRepo.findByProductId(id);
            if (inv != null) {
                inv.setQuantity(request.getQuantity());
                inventoryRepo.save(inv);
            }
        }

        ProductResponse resp = mapper.toResponse(entity);
        Inventory inv = inventoryRepo.findByProductId(id);
        if (inv != null) resp.setQuantity(inv.getQuantity());
        return resp;
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new CustomException("Sản phẩm không tồn tại");
        }
        productRepo.deleteById(id);
    }

    public boolean hasProductsInCategory(Integer categoryId) {
        return !productRepo.findByCategoryId(categoryId).isEmpty();
    }
}