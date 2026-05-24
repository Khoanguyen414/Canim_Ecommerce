package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    String orderNo;
    Long userId;

    BigDecimal subTotal;
    BigDecimal shippingFee;
    BigDecimal discountAmount;
    BigDecimal totalAmount;

    String receiverName;
    String receiverPhone;
    String shippingAddress;
    String orderNote;

    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    OrderStatus orderStatus;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    List<OrderItemResponse> items;
    List<OrderStatusHistoryResponse> histories;
}
