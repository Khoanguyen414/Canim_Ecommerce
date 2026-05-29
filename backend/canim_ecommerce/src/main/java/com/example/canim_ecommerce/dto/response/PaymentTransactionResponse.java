package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentTransactionStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionResponse {
    Long id;
    Long orderId;
    PaymentMethod paymentMethod;
    BigDecimal amount;
    PaymentTransactionStatus status;
    String transactionCode;
    String gatewayResponse;
    LocalDateTime paidAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
