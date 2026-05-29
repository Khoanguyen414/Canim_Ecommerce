package com.example.canim_ecommerce.dto.request.order;

import java.math.BigDecimal;

import com.example.canim_ecommerce.enums.PaymentMethod;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class CheckoutRequest {

    /** Saved address book entry; takes precedence over useDefaultAddress and manual fields. */
    Long addressId;

    /** When true and addressId is null, use the user's default saved address. */
    Boolean useDefaultAddress;

    @Size(max = 100, message = "Recipient name must not exceed 100 characters")
    String receiverName;

    @Size(max = 20, message = "Receiver phone must not exceed 20 characters")
    String receiverPhone;

    String shippingAddress;

    @DecimalMin(value = "-90", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90", message = "Latitude must be less than or equal to 90")
    BigDecimal receiverLatitude;

    @DecimalMin(value = "-180", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180", message = "Longitude must be less than or equal to 180")
    BigDecimal receiverLongitude;

    String orderNote;

    @NotNull(message = "Payment method must be specified")
    PaymentMethod paymentMethod;

    @Size(max = 32, message = "Shipping method id must not exceed 32 characters")
    String shippingMethodId;

    @NotNull(message = "Shipping fee is required")
    @DecimalMin(value = "0", message = "Shipping fee must be greater than or equal to 0")
    BigDecimal shippingFee;

    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    String idempotencyKey;
}
