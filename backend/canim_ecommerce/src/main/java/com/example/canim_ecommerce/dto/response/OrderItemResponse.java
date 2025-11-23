package com.example.canim_ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long productId;
    private String sku;
    private String productName;  // Trả thêm tên cho frontend hiển thị
    private Integer quantity;
    private BigDecimal price;
}