package com.example.canim_ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.category.CategoryCreationRequest;
import com.example.canim_ecommerce.dto.request.category.CategoryUpdateRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.CategoryMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;
import com.example.canim_ecommerce.service.CategoryService;
import com.example.canim_ecommerce.utils.SlugUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService{
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @Override
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream()
            .map(categoryMapper::toCategoryResponse)
            .toList();
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(categoryMapper::toCategoryResponse)
            .toList();
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Category not found"));
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreationRequest request) {
        String slug = SlugUtils.toSlug(request.getName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new ApiException(ApiStatus.NOT_FOUND, "Category already exists");
        }

        Category category = categoryMapper.toCategory(request);
        category.setSlug(slug);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Parent category not found"));
            category.setParent(parent);
        }

        Category saveCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(saveCategory);
    }

    @Override
    public CategoryResponse updateCategoryBySlug(String slug, CategoryUpdateRequest request) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Category not found"));

        categoryMapper.updateCategory(category, request);

        if (request.getParentId() != null) {
            if (category.getId().equals(request.getParentId())) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Category cannot be its own parent");
            }

            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Parent category not found"));

            category.setParent(parent);
        } 

        Category saveCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(saveCategory);
    }

    @Override
    public void deleteCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Category not found"));
        categoryRepository.delete(category);
    }
}
