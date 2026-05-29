package com.example.canim_ecommerce.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.canim_ecommerce.dto.response.ProductImageResponse;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductImage;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.ProductImageRepository;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.service.CloudinaryService;
import com.example.canim_ecommerce.service.ProductImageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductImageServiceImpl implements ProductImageService{
    ProductRepository productRepository;
    ProductImageRepository productImageRepository;
    CloudinaryService cloudinaryService;
    
    @Override
    @Transactional
    public List<ProductImageResponse> uploadImages(Long productId, List<MultipartFile> files) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        List<ProductImageResponse> responses = new ArrayList<>();

        log.info("Uploading {} image(s) for product id={}", files.size(), productId);

        for (MultipartFile file: files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            try {
                String url = cloudinaryService.uploadImage(file);

                ProductImage image = ProductImage.builder()
                    .product(product)
                    .url(url)
                    .isMain(false)
                    .position(responses.size())
                    .build();

                if (product.getImages().isEmpty() && responses.isEmpty()) {
                    image.setIsMain(true);
                }

                productImageRepository.save(image);
                product.getImages().add(image);

                responses.add(ProductImageResponse.builder()
                    .id(image.getId())
                    .url(image.getUrl())
                    .isMain(image.getIsMain())
                    .position(image.getPosition())
                    .build()
                );
            } catch (Exception e) {
                throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Upload failed: " + e.getMessage());
            }
        }

        return responses;
    }

    @Override
    @Transactional
    public void deleteProductImage(Long productId) {
        ProductImage image = productImageRepository.findById(productId)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Image not found"));
        if (image.getUrl() != null && image.getUrl().contains("cloudinary.com")) {
            try {
                cloudinaryService.deleteImage(image.getUrl());
            } catch (Exception ignored) {
                // Ignore Cloudinary delete errors.
            }
        }

        if (Boolean.TRUE.equals(image.getIsMain())) {
            Product product = image.getProduct();
            List<ProductImage> otherImages = product.getImages();
            otherImages.remove(image);

            if (!otherImages.isEmpty()) {
                ProductImage newMain = otherImages.get(0);
                newMain.setIsMain(true);
                productImageRepository.save(newMain);
            }
        }

        productImageRepository.delete(image);
    }
}
