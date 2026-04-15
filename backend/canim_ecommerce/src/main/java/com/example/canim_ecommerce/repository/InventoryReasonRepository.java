package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.InventoryReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReasonRepository extends JpaRepository<InventoryReason, String> {
}