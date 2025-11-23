package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.dto.request.CategoryRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "parentId", source = "parent.id")
    CategoryResponse toResponse(Category entity);

    @Mapping(target = "parent", ignore = true)
    Category toEntity(CategoryRequest request);
}