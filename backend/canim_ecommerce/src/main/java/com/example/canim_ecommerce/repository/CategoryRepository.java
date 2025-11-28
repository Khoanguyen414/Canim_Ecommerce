package com.example.canim_ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer>{
    List<Category> findByParentIsNull();

    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);
}
