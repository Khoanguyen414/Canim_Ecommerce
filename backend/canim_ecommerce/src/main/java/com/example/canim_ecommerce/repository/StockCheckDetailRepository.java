package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.StockCheckDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockCheckDetailRepository extends JpaRepository<StockCheckDetail, Long> {
}