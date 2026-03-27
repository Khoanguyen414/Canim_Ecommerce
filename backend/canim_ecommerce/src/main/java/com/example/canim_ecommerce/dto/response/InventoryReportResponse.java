package com.example.canim_ecommerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryReportResponse {
    private Long productId;
    private String productName;
    private String sku; 
    private Long totalQuantity; 
}