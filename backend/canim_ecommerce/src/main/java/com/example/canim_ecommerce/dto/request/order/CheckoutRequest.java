package com.example.canim_ecommerce.dto.request.order;

import com.example.canim_ecommerce.enums.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank(message = "Recipient name cannot be blank")
    String receiverName;

    @NotBlank(message = "The phone number cannot be blank")
    String receiverPhone;

    @NotBlank(message = "Shipping address cannot be blank")
    String shippingAddress;

    String orderNote;
    
    @NotNull(message = "Payment method is invalid")
    PaymentMethod paymentMethod;
}
