package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantIdAndWarehouseId(Long variantId, Long warehouseId);

 
    default Optional<Inventory> findByVariantId(Long variantId) {
        return findByVariantIdAndWarehouseId(variantId, 1L);
    }

    boolean existsByVariantIdAndWarehouseId(Long variantId, Long warehouseId);

    @Query("SELECT i FROM Inventory i JOIN i.variant v JOIN v.product p WHERE p.category.id = :categoryId")
    List<Inventory> findAllByCategoryId(@Param("categoryId") Integer categoryId);

    @Query("SELECT i FROM Inventory i JOIN i.variant v JOIN v.product p WHERE p.category.id = :categoryId AND i.warehouseId = :warehouseId")
    List<Inventory> findAllByCategoryIdAndWarehouseId(@Param("categoryId") Integer categoryId, @Param("warehouseId") Long warehouseId);
    List<Inventory> findAllByOrderByWarehouseIdAscVariant_SkuAsc();
}