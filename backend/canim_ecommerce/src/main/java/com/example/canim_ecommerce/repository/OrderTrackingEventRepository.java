package com.example.canim_ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.canim_ecommerce.entity.OrderTrackingEvent;

public interface OrderTrackingEventRepository extends JpaRepository<OrderTrackingEvent, Long> {
    List<OrderTrackingEvent> findByOrder_IdOrderByCreatedAtAsc(Long orderId);
}
