package com.example.canim_ecommerce.dto;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.NotNull;
import com.example.canim_ecommerce.Entity.Order;

import lombok.Data;







@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private Order.OrderStatus status;
    private Double totalAmount;
    private LocalDateTime orderDate;
    private List<OrderItemDTO> orderItems;

}
