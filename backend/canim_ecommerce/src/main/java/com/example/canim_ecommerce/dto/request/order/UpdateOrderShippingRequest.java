package com.example.canim_ecommerce.dto.request.order;

import com.example.canim_ecommerce.enums.ShippingStatus;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateOrderShippingRequest {
    @Size(max = 100, message = "Shipping provider must not exceed 100 characters")
    String shippingProvider;

    @Size(max = 100, message = "Tracking code must not exceed 100 characters")
    String trackingCode;

    ShippingStatus shippingStatus;
}
