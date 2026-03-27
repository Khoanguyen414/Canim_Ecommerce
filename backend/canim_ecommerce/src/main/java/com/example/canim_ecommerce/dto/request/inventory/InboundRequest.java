package com.example.canim_ecommerce.dto.request.inventory;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InboundRequest {
    private Long supplierId;
    private String note;
    private List<InboundItem> items;

    @Data
    public static class InboundItem {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}