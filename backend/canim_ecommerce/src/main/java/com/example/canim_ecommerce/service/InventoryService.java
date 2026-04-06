package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import java.io.ByteArrayInputStream;
public interface InventoryService {
    void createInboundReceipt(InboundRequest request);
    void createOutboundReceipt(OutboundRequest request);
    byte[] exportInventoryReport();
}