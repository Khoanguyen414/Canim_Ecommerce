package com.example.canim_ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String shortDescription;
    private String longDescription;
    private BigDecimal price;
    private String brand;
    private Integer categoryId;
    private String status;
    private Integer quantity; // Tồn kho hiện tại
}