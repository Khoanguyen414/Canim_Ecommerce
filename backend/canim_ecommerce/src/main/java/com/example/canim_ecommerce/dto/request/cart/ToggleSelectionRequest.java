package com.example.canim_ecommerce.dto.request.cart;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToggleSelectionRequest {
    @NotEmpty(message = "Variant IDs list cannot be empty")
    List<Long> variantIds; 

    @NotNull(message = "Selection status cannot be null")
    Boolean isSelected; 
}