package com.example.canim_ecommerce.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.enums.ProductStatus;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>{
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);

    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    // Optional<Inventory> findByProduct(Product product);

    Page<Product> findAllByStatus(ProductStatus status, Pageable pageable);  
    
}
