package com.example.canim_ecommerce.dto.request.order;

import com.example.canim_ecommerce.enums.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
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
    @NotBlank(message = "Recipient name is required")
    String receiverName;

    @NotBlank(message = "Receiver phone number is required")
    String receiverPhone;

    @NotBlank(message = "Shipping address is required")
    String shippingAddress;

    String orderNote;

    @NotNull(message = "Payment method must be specified")
    PaymentMethod paymentMethod;

    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    String idempotencyKey;
}
