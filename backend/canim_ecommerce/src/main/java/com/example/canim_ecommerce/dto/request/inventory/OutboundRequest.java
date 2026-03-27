package com.example.canim_ecommerce.dto.request.inventory;

import com.example.canim_ecommerce.enums.ReceiptReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OutboundRequest {
    private String note;
    
    @NotNull(message = "Lý do xuất kho không được để trống")
    private ReceiptReason reason; 

    private List<OutboundItem> items;

    @Data
    public static class OutboundItem {
        private Long productId;
        private Integer quantity; 
    }
}