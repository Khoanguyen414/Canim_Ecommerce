package com.example.canim_ecommerce.dto.request.order;

import java.math.BigDecimal;

import com.example.canim_ecommerce.enums.ShippingStatus;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderTrackingEventRequest {
    @NotNull(message = "Shipping status is required")
    ShippingStatus shippingStatus;

    @DecimalMin(value = "-90", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90", message = "Latitude must be less than or equal to 90")
    BigDecimal latitude;

    @DecimalMin(value = "-180", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180", message = "Longitude must be less than or equal to 180")
    BigDecimal longitude;

    @Size(max = 255, message = "Location label must not exceed 255 characters")
    String locationLabel;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    String note;
}
