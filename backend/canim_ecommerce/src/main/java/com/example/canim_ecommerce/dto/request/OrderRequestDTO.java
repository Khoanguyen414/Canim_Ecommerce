package com.example.canim_ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.example.canim_ecommerce.Entity.Order;

@Data
public class OrderRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Order items are required")
    private List<OrderItemDTO> orderItems;

    private Order.OrderStatus status; // For update
}