package com.example.canim_ecommerce.dto.request.payment;

import com.example.canim_ecommerce.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod;
}
