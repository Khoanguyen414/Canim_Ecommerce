package com.example.canim_ecommerce.dto.request.order;

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
public class CancelOrderRequest {
    @Size(max = 500, message = "Cancel reason must not exceed 500 characters")
    String reason;

    @Size(max = 500, message = "Cancel reason must not exceed 500 characters")
    String cancelReason;
}
