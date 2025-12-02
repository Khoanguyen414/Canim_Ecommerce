package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.canim_ecommerce.enums.ProductStatus;

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
public class ProductResponse {
    Long id;
    String sku;
    String name;
    String slug;
    BigDecimal price;
    String brand;
    String shortDesc;
    String longDesc;
    ProductStatus status;

    Integer categoryId;
    String categoryName;
    String categorySlug;

    List<ProductImageResponse> images;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
