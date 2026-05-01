package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;

public interface InventoryService {
    void createInboundReceipt(InboundRequest request);
    void createOutboundReceipt(OutboundRequest request);
    byte[] exportInventoryReport();
    Integer getAvailableQuantityForVariant(Long variantId);
    
    void reserveStock(Long variantId, int quantity);
    void unreserveStock(Long variantId, int quantity);
    void releaseAndExportStock(Long variantId, int quantity);
}