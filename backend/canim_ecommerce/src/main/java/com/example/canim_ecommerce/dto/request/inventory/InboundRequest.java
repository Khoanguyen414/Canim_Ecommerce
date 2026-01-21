package com.example.canim_ecommerce.dto.request.inventory; 

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InboundRequest {
    @NotNull(message = "Nhà cung cấp không được để trống")
    private Long supplierId;
    
    private String note;
    
    @NotNull(message = "Danh sách sản phẩm không được trống")
    private List<InboundItem> items;

    @Data
    public static class InboundItem {
        @NotNull(message = "ID sản phẩm không được trống")
        private Long productId;
        
        @NotNull(message = "Số lượng nhập phải lớn hơn 0")
        private Integer quantity; 
        
        @NotNull(message = "Giá nhập không được trống")
        private BigDecimal price; 
    }
}