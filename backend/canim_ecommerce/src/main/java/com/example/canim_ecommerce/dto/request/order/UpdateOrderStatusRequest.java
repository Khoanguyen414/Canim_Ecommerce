package com.example.canim_ecommerce.dto.request.order;

import com.example.canim_ecommerce.enums.OrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateOrderStatusRequest {
    @NotNull(message = "Order status must not be null")
    OrderStatus orderStatus;

    String reason;
}
