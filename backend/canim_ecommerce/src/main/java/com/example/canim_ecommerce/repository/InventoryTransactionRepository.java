package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    
    List<InventoryTransaction> findAllByVariantId(Long variantId);
    List<InventoryTransaction> findAllByOrderByCreatedAtDesc();
}