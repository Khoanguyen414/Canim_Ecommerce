package com.example.canim_ecommerce.dto.request.inventory;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InboundRequest {
    
    @NotNull(message = "Supplier ID cannot be null")
    Long supplierId;
    
    String note;
    
    @NotEmpty(message = "Items list cannot be empty")
    List<InboundItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class InboundItem {
        @NotNull(message = "Product ID cannot be null")
        Long productId;
        
        @NotNull(message = "Quantity cannot be null")
        Integer quantity;
        
        @NotNull(message = "Price cannot be null")
        BigDecimal price;
    }
}