package com.example.canim_ecommerce.dto.request.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StockCheckRequest {

    String note;

    @NotEmpty(message = "Stock check items must not be empty")
    @Valid
    List<StockCheckItem> items;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class StockCheckItem {

        @NotNull(message = "Variant ID must not be null")
        Long variantId;

        @NotNull(message = "System quantity must not be null")
        @Min(value = 0, message = "System quantity must be greater than or equal to 0")
        Integer systemQuantity;

        @NotNull(message = "Actual quantity must not be null")
        @Min(value = 0, message = "Actual quantity must be greater than or equal to 0")
        Integer actualQuantity;

        String reason; 
    }
}