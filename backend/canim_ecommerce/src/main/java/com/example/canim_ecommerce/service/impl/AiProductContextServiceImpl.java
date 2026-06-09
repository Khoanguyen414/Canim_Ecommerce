package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductImage;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.mapper.AiProductContextMapper;
import com.example.canim_ecommerce.repository.ProductImageRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.service.AiProductContextService;
import com.example.canim_ecommerce.service.InventoryService;
import java.util.List;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AiProductContextServiceImpl implements AiProductContextService {

    ProductVariantRepository productVariantRepository;
    ProductImageRepository productImageRepository;
    InventoryService inventoryService;
    AiProductContextMapper aiProductContextMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AiProductContextResponse> getAvailableProductContexts() {
        return productVariantRepository.findAiUsableVariants(ProductStatus.ACTIVE)
                .stream()
                .map(this::toContextIfAvailable)
                .filter(Objects::nonNull)
                .toList();
    }

    private AiProductContextResponse toContextIfAvailable(ProductVariant variant) {
        if (!isVariantUsableForAi(variant)) {
            return null;
        }

        Integer availableQuantity = inventoryService.getAvailableQuantityForVariant(variant.getId());

        if (availableQuantity == null || availableQuantity <= 0) {
            return null;
        }

        Product product = variant.getProduct();
        String imageUrl = findMainImageUrl(product.getId());

        return aiProductContextMapper.toAiProductContextResponse(
                variant,
                imageUrl,
                availableQuantity
        );
    }

    private boolean isVariantUsableForAi(ProductVariant variant) {
        if (variant == null) {
            return false;
        }

        Product product = variant.getProduct();

        if (product == null) {
            return false;
        }

        boolean productIsActive = ProductStatus.ACTIVE.equals(product.getStatus());
        boolean variantIsActive = Boolean.TRUE.equals(variant.getIsActive());

        return productIsActive && variantIsActive;
    }

    private String findMainImageUrl(Long productId) {
        if (productId == null) {
            return null;
        }

        return productImageRepository.findByProductIdAndIsMainTrue(productId)
                .map(ProductImage::getUrl)
                .orElse(null);
    }
}