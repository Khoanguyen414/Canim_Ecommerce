package com.example.canim_ecommerce.controller;

import java.util.Map;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.payment.CreatePaymentRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.CreatePaymentResponse;
import com.example.canim_ecommerce.dto.response.PaymentCallbackResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.PaymentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/orders/{orderId}/create")
    public ApiResponse<CreatePaymentResponse> createPayment(
            @PathVariable Long orderId,
            @RequestBody @Validated CreatePaymentRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Create payment URL successfully",
                paymentService.createPaymentUrl(orderId, request));
    }

    @GetMapping("/vnpay/return")
    public ApiResponse<PaymentCallbackResponse> vnpayReturn(@RequestParam Map<String, String> params) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Handle VNPAY callback successfully",
                paymentService.handleVnpayReturn(params));
    }

    @GetMapping("/vnpay/ipn")
    public Map<String, String> vnpayIpnGet(@RequestParam Map<String, String> params) {
        return paymentService.handleVnpayIpn(params);
    }

    @PostMapping("/vnpay/ipn")
    public Map<String, String> vnpayIpnPost(@RequestParam Map<String, String> params) {
        return paymentService.handleVnpayIpn(params);
    }

    @GetMapping("/momo/return")
    public ApiResponse<PaymentCallbackResponse> momoReturn(@RequestParam Map<String, String> params) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Handle MOMO callback successfully",
                paymentService.handleMomoReturn(params));
    }

    @PostMapping("/momo/notify")
    public Map<String, Object> momoNotify(@RequestBody Map<String, Object> payload) {
        return paymentService.handleMomoNotify(payload);
    }
}
