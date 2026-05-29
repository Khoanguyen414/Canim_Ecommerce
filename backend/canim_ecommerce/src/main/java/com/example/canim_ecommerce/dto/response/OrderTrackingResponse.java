package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.example.canim_ecommerce.enums.ShippingStatus;

import lombok.Data;

@Data
public class OrderTrackingResponse {
    Long orderId;
    BigDecimal receiverLatitude;
    BigDecimal receiverLongitude;
    String mapUrl;
    String shippingAddress;
    ShippingStatus shippingStatus;
    List<OrderTrackingEventResponse> events;
}
