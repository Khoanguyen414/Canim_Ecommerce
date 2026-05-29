package com.example.canim_ecommerce.service.model;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderShippingSnapshot {

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
}
