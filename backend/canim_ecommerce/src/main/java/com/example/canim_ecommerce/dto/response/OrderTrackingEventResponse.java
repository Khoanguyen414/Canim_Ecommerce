package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.canim_ecommerce.enums.ShippingStatus;

import lombok.Data;

@Data
public class OrderTrackingEventResponse {
    Long id;
    Long orderId;
    ShippingStatus shippingStatus;
    BigDecimal latitude;
    BigDecimal longitude;
    String locationLabel;
    String note;
    Long createdById;
    String createdByName;
    LocalDateTime createdAt;
    String googleMapsUrl;
}
