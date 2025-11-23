package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.Entity.Category;
import com.example.canim_ecommerce.dto.request.CategoryRequest;
import com.example.canim_ecommerce.dto.response.CategoryResponse;
import com.example.canim_ecommerce.exception.CustomException;
import com.example.canim_ecommerce.mapper.CategoryMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryMapper mapper;

    // Lấy tất cả danh mục (dạng cây hoặc list phẳng đều ok)
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepo.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    // Tạo danh mục mới
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepo.existsBySlug(request.getSlug())) {
            throw new CustomException("Slug đã tồn tại");
        }

        Category entity = mapper.toEntity(request);

        if (request.getParentId() != null) {
            Category parent = categoryRepo.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException("Danh mục cha không tồn tại"));
            entity.setParent(parent);
        }

        categoryRepo.save(entity);
        return mapper.toResponse(entity);
    }

    // Cập nhật danh mục
    @Transactional
    public CategoryResponse update(Integer id, CategoryRequest request) {
        Category entity = categoryRepo.findById(id)
                .orElseThrow(() -> new CustomException("Danh mục không tồn tại"));

        // Kiểm tra slug trùng (trừ chính nó)
        if (!entity.getSlug().equals(request.getSlug()) && 
            categoryRepo.existsBySlug(request.getSlug())) {
            throw new CustomException("Slug đã tồn tại");
        }

        entity.setName(request.getName());
        entity.setSlug(request.getSlug());
        entity.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepo.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException("Danh mục cha không tồn tại"));
            entity.setParent(parent);
        } else {
            entity.setParent(null);
        }

        categoryRepo.save(entity);
        return mapper.toResponse(entity);
    }

    // Xóa danh mục
    @Transactional
    public void delete(Integer id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new CustomException("Danh mục không tồn tại"));

        if (productService.hasProductsInCategory(id)) {
            throw new CustomException("Không thể xóa danh mục còn chứa sản phẩm");
        }

        categoryRepo.delete(category);
    }
}