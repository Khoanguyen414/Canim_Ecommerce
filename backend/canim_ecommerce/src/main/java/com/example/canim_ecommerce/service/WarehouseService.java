package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.dto.response.InventoryReportResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

public interface WarehouseService {
    InboundResponse createInboundReceipt(InboundRequest request);

    void createOutboundReceipt(OutboundRequest request);

    List<InventoryReportResponse> getInventoryReport();
    
    ByteArrayInputStream exportInventoryToExcel() throws IOException;
}