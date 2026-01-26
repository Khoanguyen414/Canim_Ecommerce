package com.example.canim_ecommerce.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class InboundResponse {
    private String receiptCode;
    private String supplierName;
    private String note;
    private LocalDateTime createdAt;
    private List<DetailResponse> details;

    @Data @Builder
    public static class DetailResponse {
        private Long productId; 
        private String productName;
        private String sku;     
        private String batchCode; //mã lô
        private Integer quantity;
        private BigDecimal price;
    }
}