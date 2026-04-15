package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.StockCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockCheckRepository extends JpaRepository<StockCheck, Long> {
}