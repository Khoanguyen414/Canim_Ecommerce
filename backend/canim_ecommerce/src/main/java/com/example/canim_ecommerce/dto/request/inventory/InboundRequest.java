package com.example.canim_ecommerce.dto.request.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InboundRequest {

    @NotNull(message = "Warehouse ID is required")
    Long warehouseId; // Đã bổ sung để fix lỗi getWarehouseId()

    @NotNull(message = "Supplier ID is required")
    Long supplierId;

    @NotBlank(message = "Reason code is required (e.g., PURCHASE, CUSTOMER_RETURN)")
    String reasonCode;

    String note;

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    List<InboundItem> items;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class InboundItem {
        @NotNull(message = "Variant ID is required")
        Long variantId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than 0")
        Integer quantity;

        @NotNull(message = "Price is required")
        @Min(value = 0, message = "Price cannot be negative")
        BigDecimal price;

        LocalDateTime expiredAt; 
    }
}