package com.example.canim_ecommerce.dto.response;

import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.PaymentTransactionStatus;

import lombok.Data;

@Data
public class PaymentCallbackResponse {
    Long orderId;
    String transactionCode;
    PaymentTransactionStatus transactionStatus;
    PaymentStatus orderPaymentStatus;
    String message;
}
