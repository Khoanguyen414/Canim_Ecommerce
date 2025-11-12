package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.dto.CategoryDTO;
import com.example.canim_ecommerce.dto.request.CategoryRequestDTO;

import org.springframework.stereotype.Component;

@Component

public class CategoryMapper {
    public Category toEntity(CategoryRequestDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return category;
    }

    public CategoryDTO toDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setProductCount(category.getProducts().size());
        return dto;
    }

    public void updateFromDTO(CategoryRequestDTO dto, Category category) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
    }
}
