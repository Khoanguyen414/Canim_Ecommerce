package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;

public interface InventoryService {
    Long DEFAULT_WAREHOUSE_ID = 1L;

    void createInboundReceipt(InboundRequest request);
    void createOutboundReceipt(OutboundRequest request);
    byte[] exportInventoryReport();

    Integer getAvailableQuantityForVariant(Long variantId);
    Integer getAvailableQuantityForVariant(Long warehouseId, Long variantId);

    void checkAndLockStock(Long warehouseId, Long variantId, int quantity);
    void reserveStock(Long warehouseId, Long variantId, int quantity);
    void unreserveStock(Long warehouseId, Long variantId, int quantity);
    void releaseAndExportStock(Long warehouseId, Long variantId, int quantity, Long orderId);

    default void checkAndLockStock(Long variantId, int quantity) {
        checkAndLockStock(DEFAULT_WAREHOUSE_ID, variantId, quantity);
    }

    default void reserveStock(Long variantId, int quantity) {
        reserveStock(DEFAULT_WAREHOUSE_ID, variantId, quantity);
    }

    default void unreserveStock(Long variantId, int quantity) {
        unreserveStock(DEFAULT_WAREHOUSE_ID, variantId, quantity);
    }

    default void releaseAndExportStock(Long variantId, int quantity) {
        releaseAndExportStock(DEFAULT_WAREHOUSE_ID, variantId, quantity, null);
    }
}