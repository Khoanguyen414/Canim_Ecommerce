package com.example.canim_ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.Entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}