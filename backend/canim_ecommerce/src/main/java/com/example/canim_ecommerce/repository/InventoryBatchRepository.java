package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    List<InventoryBatch> findAllByQuantityRemainingGreaterThan(Integer quantity);
    List<InventoryBatch> findAllByVariantId(Long variantId);
    Optional<InventoryBatch> findByWarehouseIdAndBatchCode(Long warehouseId, String batchCode);
    @Query("SELECT b FROM InventoryBatch b " +
           "WHERE b.warehouseId = :whId AND b.variant.id = :vId AND b.quantityRemaining > 0 " +
           "ORDER BY b.expiredAt ASC, b.createdAt ASC")
    List<InventoryBatch> findAvailableBatchesForFIFO(@Param("whId") Long warehouseId, @Param("vId") Long variantId);

    @Query("""
            SELECT DISTINCT b FROM InventoryBatch b
            INNER JOIN FETCH b.variant v
            INNER JOIN FETCH v.product
            LEFT JOIN FETCH b.supplier
            WHERE b.quantityRemaining > 0
            ORDER BY b.warehouseId ASC, v.sku ASC, b.createdAt ASC
            """)
    List<InventoryBatch> findAllActiveBatchesForExport();
}