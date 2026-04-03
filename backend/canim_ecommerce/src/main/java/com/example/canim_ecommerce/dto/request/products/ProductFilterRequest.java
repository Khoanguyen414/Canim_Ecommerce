package com.example.canim_ecommerce.dto.request.products;

import java.math.BigDecimal;

import com.example.canim_ecommerce.enums.ProductStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterRequest {
    String keyWord;
    Long categoryId;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    ProductStatus status;
}
