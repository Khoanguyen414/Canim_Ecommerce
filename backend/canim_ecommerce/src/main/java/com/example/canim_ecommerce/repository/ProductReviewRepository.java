package com.example.canim_ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.ProductReview;
import com.example.canim_ecommerce.enums.ProductReviewStatus;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    boolean existsByUserIdAndOrderItemId(Long userId, Long orderItemId);

    Page<ProductReview> findByProduct_IdAndStatus(Long productId, ProductReviewStatus status, Pageable pageable);

    Optional<ProductReview> findByIdAndUser_Id(Long id, Long userId);

    Optional<ProductReview> findByIdAndStatusNot(Long id, ProductReviewStatus status);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ProductReview r "
            + "WHERE r.product.id = :productId AND r.status = :status")
    Double averageRatingByProductId(@Param("productId") Long productId,
            @Param("status") ProductReviewStatus status);

    @Query("SELECT COUNT(r) FROM ProductReview r "
            + "WHERE r.product.id = :productId AND r.status = :status")
    long countByProductIdAndStatus(@Param("productId") Long productId,
            @Param("status") ProductReviewStatus status);

    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r "
            + "WHERE r.product.id = :productId AND r.status = :status GROUP BY r.rating")
    List<Object[]> countByRatingGrouped(@Param("productId") Long productId,
            @Param("status") ProductReviewStatus status);
}
