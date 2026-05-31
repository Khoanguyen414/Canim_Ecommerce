package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    
    List<InventoryTransaction> findAllByVariantId(Long variantId);
    List<InventoryTransaction> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT DISTINCT t FROM InventoryTransaction t
            INNER JOIN FETCH t.variant v
            ORDER BY t.createdAt DESC
            """)
    List<InventoryTransaction> findAllForExport();
}