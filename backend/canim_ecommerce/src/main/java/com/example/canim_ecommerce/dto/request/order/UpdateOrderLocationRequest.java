package com.example.canim_ecommerce.dto.request.order;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class UpdateOrderLocationRequest {
    @DecimalMin(value = "-90", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90", message = "Latitude must be less than or equal to 90")
    BigDecimal receiverLatitude;

    @DecimalMin(value = "-180", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180", message = "Longitude must be less than or equal to 180")
    BigDecimal receiverLongitude;

    String locationLabel;
}
