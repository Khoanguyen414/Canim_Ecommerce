package com.example.canim_ecommerce.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    @Positive(message = "productId phải > 0")
    private Long productId;

    @Positive(message = "Số lượng phải > 0")
    private Integer quantity;

    private BigDecimal price; // Client có thể gửi giá khuyến mãi
}