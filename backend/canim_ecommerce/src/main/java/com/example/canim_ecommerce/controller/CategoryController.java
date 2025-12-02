package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.category.CategoryCreationRequest;
import com.example.canim_ecommerce.dto.request.category.CategoryUpdateRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.CategoryResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.CategoryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryService categoryService;

    @GetMapping("/roots")
    public ApiResponse<List<CategoryResponse>> getRootCategories() {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Get root categories successfully", 
            categoryService.getRootCategories()
        );
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get all categories successfully",
            categoryService.getAllCategories()
        );
    }
    
    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> GetCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Get category successfully",
            categoryService.getCategoryBySlug(slug)
        );
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Validated CategoryCreationRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Create category successfully", 
            categoryService.createCategory(request)
        );
    }
    
    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<CategoryResponse> updateCategoryBySlug(
        @PathVariable String slug, 
        @RequestBody @Validated CategoryUpdateRequest request) 
    {
        var category = categoryService.updateCategoryBySlug(slug, request);        
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Update category successfully", 
            category);
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteCatgoryBySlug(@PathVariable String slug) {
        categoryService.deleteCategoryBySlug(slug);
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Delete category successfull",
            null
        );
    }
}
