package com.example.canim_ecommerce.service;

import java.util.List;

import com.example.canim_ecommerce.dto.request.categories.CategoryCreationRequest;
import com.example.canim_ecommerce.dto.request.categories.CategoryUpdateRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getRootCategories();
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(int id);
    CategoryResponse getCategoryBySlug(String slug);
    CategoryResponse createCategory(CategoryCreationRequest request);
    CategoryResponse updateCategory(int id, CategoryUpdateRequest request);
    void deleteCategory(int id);
}
