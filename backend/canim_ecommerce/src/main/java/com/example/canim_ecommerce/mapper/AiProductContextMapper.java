package com.example.canim_ecommerce.mapper;
import java.util.StringJoiner;
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
            Integer availableQuantity
    ) {
        Product product = variant.getProduct();
        Category category = product.getCategory();
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
                .searchableText(buildSearchableText(product, variant, category))
                .build();
    }

    private String buildSearchableText(
            Product product,
            ProductVariant variant,
            Category category
    ) {
        StringJoiner joiner = new StringJoiner(" ");
        addIfNotBlank(joiner, product.getName());
        addIfNotBlank(joiner, product.getShortDesc());
        addIfNotBlank(joiner, product.getLongDesc());
        addIfNotBlank(joiner, product.getBrand());
        // Thêm thương hiệu vào searchableText nếu có.

        if (category != null) {
            addIfNotBlank(joiner, category.getName());
            addIfNotBlank(joiner, category.getSlug());
        }

        addIfNotBlank(joiner, variant.getSku());
        addIfNotBlank(joiner, variant.getColor());
        addIfNotBlank(joiner, variant.getSize());
        return joiner.toString().trim().toLowerCase();
         
    }

    private void addIfNotBlank(StringJoiner joiner, String value) {
        if (value != null && !value.trim().isEmpty()) {
            joiner.add(value.trim());
            
        }
    }
}