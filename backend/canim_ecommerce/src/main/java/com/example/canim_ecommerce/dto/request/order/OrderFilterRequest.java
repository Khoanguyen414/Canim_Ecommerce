package com.example.canim_ecommerce.dto.request.order;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderFilterRequest {
    String keywords;
    OrderStatus orderStatus;
    PaymentStatus paymentStatus;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime toDate;
}
