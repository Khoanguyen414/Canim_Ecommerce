package com.example.canim_ecommerce.dto.request.products;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    String name;

    @Min(0)
    BigDecimal price;

    String shortDesc;
    String longDesc;
    String brand;

    Integer categoryId;
}
