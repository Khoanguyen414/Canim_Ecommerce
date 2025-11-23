package com.example.canim_ecommerce.dto.response;

import lombok.Data;

@Data
public class CategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private Integer parentId;
    private String description;
}