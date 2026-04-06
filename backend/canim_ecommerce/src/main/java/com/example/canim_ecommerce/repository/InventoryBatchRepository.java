package com.example.canim_ecommerce.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.InventoryBatch;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    @Query("SELECT b FROM InventoryBatch b " +
           "WHERE b.warehouseId = :warehouseId " +
           "AND b.variant.id = :variantId " +
           "AND b.quantityRemaining > 0 " +
           "ORDER BY b.expiredAt ASC NULLS LAST, b.createdAt ASC")
    List<InventoryBatch> findAvailableBatchesForFIFO(@Param("warehouseId") Long warehouseId, 
                                                     @Param("variantId") Long variantId);

    // 💡 Tiện ích thêm: Tìm chính xác 1 lô hàng trong kho (Dùng cho máy quét mã vạch QR/Barcode)
    Optional<InventoryBatch> findByWarehouseIdAndBatchCode(Long warehouseId, String batchCode);
}