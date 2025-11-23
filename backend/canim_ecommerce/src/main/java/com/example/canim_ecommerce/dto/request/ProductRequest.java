package com.example.canim_ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank private String sku;
    @NotBlank private String name;
    @NotBlank private String slug;
    private String shortDescription;
    private String longDescription;
    @Positive private BigDecimal price;
    private String brand;
    private Integer categoryId;
    private String status; // "ACTIVE", "INACTIVE"
    private Integer quantity; // Số lượng nhập kho
}