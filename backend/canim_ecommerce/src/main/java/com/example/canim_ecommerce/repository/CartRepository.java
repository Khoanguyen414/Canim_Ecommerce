package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Cart;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @Query("""
            SELECT DISTINCT c
            FROM Cart c
            LEFT JOIN FETCH c.items i
            LEFT JOIN FETCH i.variant v
            LEFT JOIN FETCH v.product p
            WHERE c.userId = :userId
            """)
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
}