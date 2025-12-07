package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.products.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.products.ProductUpdateRequest;
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
import com.example.canim_ecommerce.service.SkuService;
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
    SkuService skuService;

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
            .map(productMapper::toProductResponse);
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
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request) {
        String slug = SlugUtils.toSlug(request.getName());

        String sku = skuService.generateOrValidateSku(request.getSku(), request.getName(), request.getColor());

        if (productRepository.existsBySlug(slug)) {
            throw new ApiException(ApiStatus.NOT_FOUND, "Product slug already exists");
        }

        Product product = productMapper.toProduct(request);
        product.setSku(sku);
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
    public void changeProductStatus(Long id, ProductStatus status) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        product.setStatus(status);
        productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        productRepository.delete(product);
    }
}
