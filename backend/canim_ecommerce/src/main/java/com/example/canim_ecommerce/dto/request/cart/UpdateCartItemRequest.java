package com.example.canim_ecommerce.dto.request.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCartItemRequest {

    @NotNull(message = "Variant ID cannot be null")
    Long variantId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity cannot be negative") 
    @Max(value = 99, message = "Quantity cannot exceed 99 items") 
    Integer quantity;

    @NotNull(message = "Select status cannot be null")
    Boolean isSelected;
}