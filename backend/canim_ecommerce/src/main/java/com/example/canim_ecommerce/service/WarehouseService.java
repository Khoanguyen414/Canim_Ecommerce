package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.response.InboundResponse;

public interface WarehouseService {
    InboundResponse createInboundReceipt(InboundRequest request);
}