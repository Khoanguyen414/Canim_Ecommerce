package com.example.canim_ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.ProductImage;
import java.util.Optional;
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long>{
    Optional<ProductImage> findByProductIdAndIsMainTrue(Long productId);
}
