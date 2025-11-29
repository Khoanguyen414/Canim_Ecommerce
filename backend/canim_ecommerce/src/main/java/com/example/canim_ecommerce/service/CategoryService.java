package com.example.canim_ecommerce.service;

import java.util.List;

import com.example.canim_ecommerce.dto.request.CategoryRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getRootCategories();
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryBySlug(String slug);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategoryBySlug(String slug, CategoryRequest request);
    void deleteCategoryBySlug(String slug);
}
