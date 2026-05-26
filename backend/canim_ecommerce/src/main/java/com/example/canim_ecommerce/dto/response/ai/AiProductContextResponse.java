package com.example.canim_ecommerce.dto.response.ai;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiProductContextResponse {

    Long productId;
    Long variantId;
    String sku;
    String name;
    String slug;
    String shortDesc;
    String longDesc;
    String brand;
    Integer categoryId;
    String categoryName;
    String categorySlug;
    String color;
    String size;
    BigDecimal price;
    Integer availableQuantity;
    String imageUrl;
    String productStatus;
    Boolean variantActive;
    String searchableText;

}