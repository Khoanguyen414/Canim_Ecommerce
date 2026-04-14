package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByIsDeletedFalseOrderByIdDesc();
}