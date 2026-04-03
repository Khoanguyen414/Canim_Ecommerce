package com.example.canim_ecommerce.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product>{
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);

    Optional<Product> findBySlug(String slug);
    // Optional<Inventory> findByProduct(Product product);
}
