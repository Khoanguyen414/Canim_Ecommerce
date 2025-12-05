package com.example.canim_ecommerce.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.canim_ecommerce.dto.request.products.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.products.ProductUpdateRequest;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import com.example.canim_ecommerce.enums.ProductStatus;

public interface ProductService {
    Page<ProductResponse> getAllProducts(Pageable pageable);
    ProductResponse getProductById(Long id);   
    ProductResponse getProductBySku(String sku);   
    ProductResponse getProductBySlug(String slug);
    ProductResponse createProduct(ProductCreationRequest request);
    ProductResponse updateProduct(Long id, ProductUpdateRequest request);
    void changeProductStatus(Long id, ProductStatus status);
    void deleteProduct(Long id);    
}
