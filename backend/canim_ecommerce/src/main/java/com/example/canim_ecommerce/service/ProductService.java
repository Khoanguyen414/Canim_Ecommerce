package com.example.canim_ecommerce.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.dto.ProductDTO;
import com.example.canim_ecommerce.dto.request.ProductRequestDTO;
import com.example.canim_ecommerce.mapper.ProductMapper;
import com.example.canim_ecommerce.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    public ProductDTO createProduct(ProductRequestDTO dto) {
        if (productRepository.findByNameAndCategoryId(dto.getName(), dto.getCategoryId()).isPresent()) {
            throw new IllegalArgumentException("Product name already exists in this category"); // Nghiệp vụ: Unique per category
        }
        Product product = productMapper.toEntity(dto);
        product = productRepository.save(product);
        return productMapper.toDTO(product);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDTO(product);
    }

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toDTO);
    }

    public ProductDTO updateProduct(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        Long categoryId = dto.getCategoryId() != null ? dto.getCategoryId() : product.getCategory().getId();
        if (!product.getName().equals(dto.getName()) && 
            productRepository.findByNameAndCategoryId(dto.getName(), categoryId).isPresent()) {
            throw new IllegalArgumentException("Product name already exists in this category");
        }
        productMapper.updateFromDTO(dto, product);
        product = productRepository.save(product);
        return productMapper.toDTO(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product); // Nghiệp vụ: Có thể thêm check nếu sản phẩm đang trong đơn hàng
    }
}