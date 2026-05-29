package com.example.canim_ecommerce.service;

import java.util.Map;

import com.example.canim_ecommerce.dto.request.payment.CreatePaymentRequest;
import com.example.canim_ecommerce.dto.response.CreatePaymentResponse;
import com.example.canim_ecommerce.dto.response.PaymentCallbackResponse;

public interface PaymentService {
    CreatePaymentResponse createPaymentUrl(Long orderId, CreatePaymentRequest request);

    PaymentCallbackResponse handleVnpayReturn(Map<String, String> params);

    Map<String, String> handleVnpayIpn(Map<String, String> params);

    PaymentCallbackResponse handleMomoReturn(Map<String, String> params);

    Map<String, Object> handleMomoNotify(Map<String, Object> payload);
}
