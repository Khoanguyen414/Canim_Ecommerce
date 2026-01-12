package com.example.canim_ecommerce.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.canim_ecommerce.dto.response.ProductImageResponse;

public interface ProductImageService {
    List<ProductImageResponse> uploadImages(Long productId, List<MultipartFile> files);
    void deleteProductImage(Long imageId);
}
