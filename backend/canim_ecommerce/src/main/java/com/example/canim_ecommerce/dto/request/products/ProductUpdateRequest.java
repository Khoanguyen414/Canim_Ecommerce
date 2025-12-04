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
    String shortDesc;
    String longDesc;

    @Min(0)
    BigDecimal price;

    String brand;
    String color; 
    String size;

    Integer categoryId;
}
