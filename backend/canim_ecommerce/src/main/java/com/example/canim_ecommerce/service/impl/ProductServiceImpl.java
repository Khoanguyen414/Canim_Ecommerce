package com.example.canim_ecommerce.service.impl;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.canim_ecommerce.dto.request.products.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.products.ProductStatusRequest;
import com.example.canim_ecommerce.dto.request.products.ProductUpdateRequest;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.ProductMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.service.ProductService;
import com.example.canim_ecommerce.utils.SlugUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService{
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    ProductMapper productMapper;

    @Override
    public PageResponse<ProductResponse> getAllProducts(int pageNum, int sizePage) {
        Pageable pageable = PageRequest.of(pageNum - 1, sizePage, Sort.by("updatedAt").descending());
        Page<Product> pageData = productRepository.findAll(pageable);

        List<ProductResponse> data = pageData.getContent().stream()
                .map(productMapper::toProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
            .page(pageNum)
            .size(sizePage)
            .totalElements(pageData.getTotalElements())
            .totalPages(pageData.getTotalPages())
            .data(data)
            .build();
    }

    @Override
    public PageResponse<ProductResponse> getProductsPublic(int pageNum, int sizePage) {
        Pageable pageable = PageRequest.of(pageNum - 1, sizePage, Sort.by("createdAt").descending());
        Page<Product> pageData = productRepository.findAllByStatus(ProductStatus.active, pageable);

        List<ProductResponse> data = pageData.getContent().stream()
                .map(productMapper::toProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
            .page(pageNum)
            .size(sizePage)
            .totalElements(pageData.getTotalElements())
            .totalPages(pageData.getTotalPages())
            .data(data)
            .build();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found with sku: " + sku));
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found with slug: " + slug));
        ProductResponse response = productMapper.toProductResponse(product);

        // Inventory inventory = inventoryRepository.findByProduct(product).orElse(null);
        // response.setQuantity(inventory != null ? inventory.getQuantity() : 0);
        return response;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request) {
        String slug = SlugUtils.toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Product slug already exists");
        }

        if (productRepository.existsBySku(request.getSku())) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Mã SKU này đã tồn tại: " + request.getSku());
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(slug);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Category not found"));
            product.setCategory(category);
        }

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        productMapper.updateProduct(product, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product's category not found"));
            product.setCategory(category);
        }

        return productMapper.toProductResponse(productRepository.save(product));
    } 

    @Override
    @Transactional
    public void changeProductStatus(Long id, ProductStatusRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        product.setStatus(request.getStatus());
        productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        productRepository.delete(product);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importProducts(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream)){
            Sheet sheet = workbook.getSheetAt(0);
            List<Product> productsToSave = new ArrayList<>();

            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                int rowIndex = i;
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = row.getCell(0).getStringCellValue();
                String sku = row.getCell(1).getStringCellValue();
                double price = row.getCell(2).getNumericCellValue();
                double catId = row.getCell(3).getNumericCellValue();

                if (productRepository.existsBySku(sku)) {
                    throw new ApiException(
                        ApiStatus.NOT_FOUND, 
                        "The line " + (rowIndex + 1) + ": SKU " + sku + " already exists!");
                }

                Product product = Product.builder()
                    .name(name)
                    .sku(sku)
                    .slug(SlugUtils.toSlug(name))
                    .price(BigDecimal.valueOf(price))
                    .status(ProductStatus.active)
                    .build();

                Category category = categoryRepository.findById((int) catId)
                    .orElseThrow(() -> new ApiException(
                        ApiStatus.NOT_FOUND, 
                        "The line " + (rowIndex + 1) + ": Category ID " + catId + " does not exist!"));

                product.setCategory(category);

                productsToSave.add(product);
            }

            productRepository.saveAll(productsToSave);
        } catch (Exception e) {
            throw new ApiException(ApiStatus.INVALID_INPUT, "Error reading Excel file: " + e.getMessage());
        }            
    }

}
