package com.example.canim_ecommerce.repository.inventory;

import com.example.canim_ecommerce.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    List<InventoryBatch> findByProductIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(Long productId, Integer quantity);
    @Query("SELECT b.product.id, b.product.name, b.product.sku, SUM(b.quantityRemaining) " +
           "FROM InventoryBatch b " +
           "GROUP BY b.product.id, b.product.name, b.product.sku " +
           "HAVING SUM(b.quantityRemaining) > 0")
    List<Object[]> getInventoryReport();
}