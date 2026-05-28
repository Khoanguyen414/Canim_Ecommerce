package com.example.canim_ecommerce.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Optional<Order> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus orderStatus, Pageable pageable);

    List<Order> findTop100ByOrderStatusAndCreatedAtBeforeOrderByCreatedAtAsc(
            OrderStatus orderStatus,
            LocalDateTime cutoff);

    boolean existsByOrderNo(String orderNo);

    @Query(value = """
            SELECT COUNT(*)
            FROM orders
            WHERE (:fromDate IS NULL OR created_at >= :fromDate)
              AND (:toDate IS NULL OR created_at < :toDate)
            """, nativeQuery = true)
    long countOrdersInRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            SELECT COUNT(*)
            FROM orders
            WHERE order_status = :status
              AND (:fromDate IS NULL OR created_at >= :fromDate)
              AND (:toDate IS NULL OR created_at < :toDate)
            """, nativeQuery = true)
    long countOrdersByStatusInRange(
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE order_status = :status
              AND (:fromDate IS NULL OR created_at >= :fromDate)
              AND (:toDate IS NULL OR created_at < :toDate)
            """, nativeQuery = true)
    BigDecimal sumRevenueByStatusInRange(
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
}
