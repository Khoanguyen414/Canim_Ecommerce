package com.example.canim_ecommerce.dto.request.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboundRequest {

    @NotNull(message = "Warehouse ID is required")
    Long warehouseId; // Đã bổ sung để fix lỗi getWarehouseId()

    @NotBlank(message = "Reason code is required (e.g., SALES_ORDER, RETURN_TO_SUPPLIER)")
    String reasonCode;

    Long orderId; 

    String note;

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    List<OutboundItem> items;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OutboundItem {
        @NotNull(message = "Variant ID is required")
        Long variantId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than 0")
        Integer quantity;
    }
}