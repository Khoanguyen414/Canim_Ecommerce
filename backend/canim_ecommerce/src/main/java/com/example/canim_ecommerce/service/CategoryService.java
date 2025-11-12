package com.example.canim_ecommerce.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.dto.CategoryDTO;
import com.example.canim_ecommerce.dto.request.CategoryRequestDTO;
import com.example.canim_ecommerce.mapper.CategoryMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    public CategoryDTO createCategory(CategoryRequestDTO dto) {
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Category name already exists"); // Nghiệp vụ: Đảm bảo unique
        }
        Category category = categoryMapper.toEntity(dto);
        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    /**
     * @param id
     * @return
     */
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toDTO(category);
    }

    public Page<CategoryDTO> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(categoryMapper::toDTO); // Nghiệp vụ: Phân trang cho quản lý lớn
    }

    public CategoryDTO updateCategory(Long id, CategoryRequestDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (!category.getName().equals(dto.getName()) && categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Category name already exists");
        }
        categoryMapper.updateFromDTO(dto, category);
        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (!category.getProducts().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with associated products. Reassign products first."); // Nghiệp vụ: Bảo vệ dữ liệu sản phẩm
        }
        categoryRepository.delete(category);
    }
}