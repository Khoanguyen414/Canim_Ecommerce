package com.example.canim_ecommerce.dto;

import com.example.canim_ecommerce.Entity.Product;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private String description;
    private Integer stockQuantity;
    private Product.ProductStatus status;
    private Long categoryId;
}
