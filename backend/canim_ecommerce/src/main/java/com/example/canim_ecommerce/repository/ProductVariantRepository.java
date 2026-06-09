package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ProductStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    boolean existsBySku(String sku);

    Optional<ProductVariant> findBySku(String sku);

    @Query("""
            SELECT v
            FROM ProductVariant v
            JOIN FETCH v.product p
            WHERE v.id = :id
            """)
    Optional<ProductVariant> findByIdWithProduct(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT v
            FROM ProductVariant v
            JOIN FETCH v.product p
            LEFT JOIN FETCH p.category c
            WHERE v.isActive = true
              AND p.status = :productStatus
            ORDER BY p.createdAt DESC, v.createdAt DESC
            """)
    List<ProductVariant> findAiUsableVariants(@Param("productStatus") ProductStatus productStatus);
}