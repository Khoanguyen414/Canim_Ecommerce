package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.ShippingStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailResponse {
    Long id;
    String orderNo;
    Long userId;

    OrderStatus orderStatus;
    PaymentStatus paymentStatus;
    PaymentMethod paymentMethod;
    String orderStatusLabel;
    String paymentStatusLabel;
    Boolean canCancel;
    String nextAction;

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
    BigDecimal receiverLatitude;
    BigDecimal receiverLongitude;
    String mapUrl;
    String orderNote;

    String cancelReason;
    Long cancelledById;
    String cancelledByName;

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
    List<OrderTrackingEventResponse> trackingEvents;
    PaymentTransactionResponse latestPaymentTransaction;
}
