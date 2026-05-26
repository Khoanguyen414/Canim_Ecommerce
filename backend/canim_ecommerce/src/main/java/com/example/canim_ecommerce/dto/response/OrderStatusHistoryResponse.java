package com.example.canim_ecommerce.dto.response;

import java.time.LocalDateTime;

import com.example.canim_ecommerce.enums.OrderStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatusHistoryResponse {
    Long id;
    OrderStatus fromStatus;
    OrderStatus toStatus;
    String reason;
    Long createdBy;
    LocalDateTime createdAt;
}
