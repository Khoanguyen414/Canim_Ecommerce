package com.example.canim_ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;

@Component
public class AiProductContextMapper {

    public AiProductContextResponse toAiProductContextResponse(
            ProductVariant variant,
            String imageUrl,
            Integer availableQuantity) {
        Product product = variant.getProduct();
        Category category = product.getCategory();

        String searchableText = buildSearchableText(product, variant, category);

        return AiProductContextResponse.builder()
                .productId(product.getId())
                .variantId(variant.getId())
                .sku(variant.getSku())

                .name(product.getName())
                .slug(product.getSlug())
                .shortDesc(product.getShortDesc())
                .longDesc(product.getLongDesc())
                .brand(product.getBrand())

                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .categorySlug(category != null ? category.getSlug() : null)

                .color(variant.getColor())
                .size(variant.getSize())
                .price(variant.getPrice())
                .availableQuantity(availableQuantity)

                .imageUrl(imageUrl)

                .productStatus(product.getStatus() != null ? product.getStatus().name() : null)
                .variantActive(variant.getIsActive())

                .searchableText(searchableText)
                .build();
    }

    private String buildSearchableText(
            Product product,
            ProductVariant variant,
            Category category) {
        StringBuilder builder = new StringBuilder();

        append(builder, product.getName());
        append(builder, product.getSlug());
        append(builder, product.getShortDesc());
        append(builder, product.getLongDesc());
        append(builder, product.getBrand());

        if (category != null) {
            append(builder, category.getName());
            append(builder, category.getSlug());
        }

        append(builder, variant.getSku());
        append(builder, variant.getColor());
        append(builder, variant.getSize());

        return builder.toString()
                .trim()
                .replaceAll("\\s+", " ");
    }

    private void append(StringBuilder builder, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        builder.append(value).append(" ");
    }
}