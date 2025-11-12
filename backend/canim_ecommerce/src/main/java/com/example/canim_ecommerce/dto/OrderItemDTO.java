package com.example.canim_ecommerce.dto;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import com.example.canim_ecommerce.Entity.Order;
import jakarta.validation.constraints.NotNull;

@Data
public class OrderItemDTO {
    private Long productId;
    private Integer quantity;
    private Double unitPrice;
}