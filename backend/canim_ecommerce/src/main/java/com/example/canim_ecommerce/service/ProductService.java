package com.example.canim_ecommerce.service;

import org.springframework.web.multipart.MultipartFile;

import com.example.canim_ecommerce.dto.request.product.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.product.ProductFilterRequest;
import com.example.canim_ecommerce.dto.request.product.ProductStatusRequest;
import com.example.canim_ecommerce.dto.request.product.ProductUpdateRequest;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductResponse;

public interface ProductService {
    PageResponse<ProductResponse> getProducts(ProductFilterRequest filterRequest, int pageNum, int sizePage, String sortBy, String sortDir);
    ProductResponse getProductById(Long id);   
    ProductResponse getProductBySku(String sku);   
    ProductResponse getProductBySlug(String slug);
    ProductResponse createProduct(ProductCreationRequest request);
    ProductResponse updateProduct(Long id, ProductUpdateRequest request);
    void changeProductStatus(Long id, ProductStatusRequest request);
    void deleteProduct(Long id);
    void importProducts(MultipartFile file);
}
