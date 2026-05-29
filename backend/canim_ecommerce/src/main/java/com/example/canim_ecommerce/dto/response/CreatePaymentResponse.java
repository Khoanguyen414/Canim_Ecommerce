package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;

import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentTransactionStatus;

import lombok.Data;

@Data
public class CreatePaymentResponse {
    String paymentUrl;
    String transactionCode;
    PaymentMethod paymentMethod;
    BigDecimal amount;
    PaymentTransactionStatus status;
}
