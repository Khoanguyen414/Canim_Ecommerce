package com.example.canim_ecommerce.service;

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

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductImageService {
    ProductRepository productRepository;
    ProductImageRepository productImageRepository;
    CloudinaryService cloudinaryService;

    @Transactional
    public List<ProductImageResponse> uploadImages(Long productId, List<MultipartFile> files) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        List<ProductImageResponse> responses = new ArrayList<>();

        for (MultipartFile file: files) {
            try {
                String url = cloudinaryService.uploadImage(file);

                ProductImage image = ProductImage.builder()
                    .product(product)
                    .url(url)
                    .isMain(false)
                    .position(0)
                    .build();

                if (product.getImages().isEmpty() && responses.isEmpty()) {
                    image.setIsMain(true);
                }

                productImageRepository.save(image);

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
}
