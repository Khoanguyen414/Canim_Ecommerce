package com.example.canim_ecommerce.service;

import java.util.List;

import com.example.canim_ecommerce.dto.request.category.CategoryCreationRequest;
import com.example.canim_ecommerce.dto.request.category.CategoryUpdateRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getRootCategories();
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryBySlug(String slug);
    CategoryResponse createCategory(CategoryCreationRequest request);
    CategoryResponse updateCategoryBySlug(String slug, CategoryUpdateRequest request);
    void deleteCategoryBySlug(String slug);
}
