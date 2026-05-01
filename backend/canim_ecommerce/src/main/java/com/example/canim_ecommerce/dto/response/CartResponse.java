package com.example.canim_ecommerce.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartResponse {
    Long id;
    Long userId;
    List<CartItemResponse> items;
    BigDecimal totalAmount; 
}