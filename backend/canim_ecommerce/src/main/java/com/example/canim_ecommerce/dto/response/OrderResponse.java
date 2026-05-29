package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.ShippingStatus;

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
    Long addressId;
    String receiverProvinceName;
    String receiverDistrictName;
    String receiverWardName;
    String receiverStreetAddress;
    String orderNote;

    String cancelReason;
    Long cancelledById;
    String cancelledByName;

    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    OrderStatus orderStatus;
    String orderStatusLabel;
    String paymentStatusLabel;
    Boolean canCancel;
    String nextAction;

    String shippingProvider;
    String trackingCode;
    ShippingStatus shippingStatus;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime confirmedAt;
    LocalDateTime shippedAt;
    LocalDateTime deliveredAt;
    LocalDateTime cancelledAt;

    List<OrderItemResponse> items;
    List<OrderStatusHistoryResponse> histories;
}
