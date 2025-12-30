package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.products.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.products.ProductStatusRequest;
import com.example.canim_ecommerce.dto.request.products.ProductUpdateRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.ProductService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {
    ProductService productService;

    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAllProducts(
        @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) 
        Pageable pageable) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get products successfully", 
            productService.getAllProducts(pageable)
        );
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get product detail", 
            productService.getProductById(id)
        );
    }
    
    @GetMapping("/sku/{sku}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<ProductResponse> getProductBySku(@PathVariable String sku) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get product detail by sku: " + sku, 
            productService.getProductBySku(sku)
        );
    }
    
    @GetMapping("/slug/{slug}")
    public ApiResponse<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get product detail by slug: " + slug, 
            productService.getProductBySlug(slug)
        );
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<ProductResponse> createProduct(@RequestBody @Validated ProductCreationRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Product created successfully", 
            productService.createProduct(request)
        );
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody @Validated ProductUpdateRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Product updated successfully", 
            productService.updateProduct(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> changeStatus(@PathVariable Long id, @RequestBody ProductStatusRequest request) {
        productService.changeProductStatus(id, request);
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Status changed", 
            null
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Product deleted successfully", 
            null
        );
    }
}
