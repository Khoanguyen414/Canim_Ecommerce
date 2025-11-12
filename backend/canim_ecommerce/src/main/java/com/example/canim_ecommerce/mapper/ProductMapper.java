package com.example.canim_ecommerce.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.dto.ProductDTO;
import com.example.canim_ecommerce.dto.request.ProductRequestDTO;
import com.example.canim_ecommerce.repository.CategoryRepository;

@Component
public class ProductMapper {

    @Autowired
    private CategoryRepository categoryRepository;

    public Product toEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setStockQuantity(dto.getStockQuantity());
        product.setStatus(dto.getStatus());
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")); // Nghiệp vụ: Phải có danh mục
        product.setCategory(category);
        return product;
    }

    public ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setDescription(product.getDescription());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setStatus(product.getStatus());
        dto.setCategoryId(product.getCategory().getId());
        return dto;
    }

    public void updateFromDTO(ProductRequestDTO dto, Product product) {
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setStockQuantity(dto.getStockQuantity());
        product.setStatus(dto.getStatus());
        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
    }
}