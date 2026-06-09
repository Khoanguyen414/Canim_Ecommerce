package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductImage;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.repository.ProductImageRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.service.AiProductContextService;
import com.example.canim_ecommerce.service.InventoryService;
import java.util.List;
import java.util.Locale;
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
        Category category = product.getCategory();
        String imageUrl = findMainImageUrl(product.getId());

        return AiProductContextResponse.builder()
                .productId(product.getId())
                .variantId(variant.getId())
                .sku(variant.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDesc(product.getShortDesc())
                .longDesc(product.getLongDesc())
                .brand(product.getBrand())
                .categoryId(category == null ? null : category.getId())
                .categoryName(category == null ? null : category.getName())
                .categorySlug(category == null ? null : category.getSlug())
                .color(variant.getColor())
                .size(variant.getSize())
                .price(variant.getPrice())
                .availableQuantity(availableQuantity)
                .imageUrl(imageUrl)
                .productStatus(product.getStatus() == null ? null : product.getStatus().name())
                .variantActive(variant.getIsActive())
                .searchableText(buildSearchableText(product, variant, category))
                .build();
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

    private String buildSearchableText(Product product, ProductVariant variant, Category category) {
        String rawText = String.join(" ",
                safe(product.getName()),
                safe(product.getShortDesc()),
                safe(product.getLongDesc()),
                safe(product.getBrand()),
                safe(category == null ? null : category.getName()),
                safe(category == null ? null : category.getSlug()),
                safe(variant.getSku()),
                safe(variant.getColor()),
                safe(variant.getSize())
        );

        return rawText
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}