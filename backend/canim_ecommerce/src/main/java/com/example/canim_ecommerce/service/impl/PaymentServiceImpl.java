package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.payment.CreatePaymentRequest;
import com.example.canim_ecommerce.dto.response.CreatePaymentResponse;
import com.example.canim_ecommerce.dto.response.PaymentCallbackResponse;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.PaymentTransaction;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.PaymentTransactionStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.OrderRepository;
import com.example.canim_ecommerce.repository.PaymentTransactionRepository;
import com.example.canim_ecommerce.service.PaymentService;
import com.example.canim_ecommerce.service.payment.MomoGatewayClient;
import com.example.canim_ecommerce.service.payment.VnpayGatewayClient;
import com.example.canim_ecommerce.utils.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    OrderRepository orderRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    VnpayGatewayClient vnpayGatewayClient;
    MomoGatewayClient momoGatewayClient;
    HttpServletRequest httpServletRequest;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreatePaymentResponse createPaymentUrl(Long orderId, CreatePaymentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Order order = orderRepository.findByIdAndUserId(orderId, currentUserId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));

        validateOrderForPayment(order);
        PaymentMethod requestedMethod = request.getPaymentMethod();
        if (requestedMethod == null || requestedMethod == PaymentMethod.COD) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Payment method must be VNPAY or MOMO");
        }

        if (order.getPaymentMethod() != requestedMethod) {
            order.setPaymentMethod(requestedMethod);
        }

        PaymentTransaction transaction = paymentTransactionRepository
                .findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .orElseGet(() -> PaymentTransaction.builder()
                        .order(order)
                        .build());

        if (!StringUtils.hasText(transaction.getTransactionCode())) {
            transaction.setTransactionCode(generateTransactionCode(requestedMethod));
        }
        transaction.setPaymentMethod(requestedMethod);
        transaction.setAmount(order.getTotalAmount());
        transaction.setStatus(PaymentTransactionStatus.PENDING);
        transaction.setPaidAt(null);

        String paymentUrl;
        if (requestedMethod == PaymentMethod.VNPAY) {
            paymentUrl = vnpayGatewayClient.createPaymentUrl(
                    transaction.getTransactionCode(),
                    order.getTotalAmount(),
                    resolveClientIp());
            transaction.setGatewayResponse("{\"paymentUrl\":\"" + paymentUrl + "\"}");
        } else {
            Map<String, Object> gatewayResult = momoGatewayClient.createPayment(
                    transaction.getTransactionCode(),
                    order.getTotalAmount());
            if (asInt(gatewayResult.get("resultCode")) != 0) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "MOMO gateway rejected the request");
            }
            paymentUrl = String.valueOf(gatewayResult.get("payUrl"));
            transaction.setGatewayResponse(momoGatewayClient.toJson(gatewayResult));
        }

        paymentTransactionRepository.save(transaction);
        orderRepository.save(order);

        CreatePaymentResponse response = new CreatePaymentResponse();
        response.setPaymentUrl(paymentUrl);
        response.setTransactionCode(transaction.getTransactionCode());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setAmount(transaction.getAmount());
        response.setStatus(transaction.getStatus());
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentCallbackResponse handleVnpayReturn(Map<String, String> params) {
        return applyVnpayCallback(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, String> handleVnpayIpn(Map<String, String> params) {
        Map<String, String> response = new HashMap<>();
        if (!vnpayGatewayClient.verifySignature(params)) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid signature");
            return response;
        }
        applyVnpayCallback(params);
        response.put("RspCode", "00");
        response.put("Message", "Confirm success");
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentCallbackResponse handleMomoReturn(Map<String, String> params) {
        Map<String, Object> payload = new HashMap<>();
        payload.putAll(params);
        return applyMomoCallback(payload);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> handleMomoNotify(Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        if (!momoGatewayClient.verifyCallbackSignature(payload)) {
            response.put("resultCode", 1);
            response.put("message", "Invalid signature");
            return response;
        }
        applyMomoCallback(payload);
        response.put("resultCode", 0);
        response.put("message", "Success");
        return response;
    }

    private PaymentCallbackResponse applyVnpayCallback(Map<String, String> params) {
        if (!vnpayGatewayClient.verifySignature(params)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid VNPAY signature");
        }
        String transactionCode = params.get("vnp_TxnRef");
        if (!StringUtils.hasText(transactionCode)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Missing VNPAY transaction code");
        }

        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Payment transaction not found"));
        Order order = transaction.getOrder();

        if (transaction.getStatus() == PaymentTransactionStatus.PAID) {
            return toCallbackResponse(order, transaction, "Payment already confirmed");
        }

        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);

        transaction.setGatewayResponse(vnpayGatewayClient.toJson(params));
        if (success) {
            transaction.setStatus(PaymentTransactionStatus.PAID);
            transaction.setPaidAt(LocalDateTime.now());
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            transaction.setStatus(PaymentTransactionStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }

        paymentTransactionRepository.save(transaction);
        orderRepository.save(order);
        return toCallbackResponse(order, transaction, success ? "Payment success" : "Payment failed");
    }

    private PaymentCallbackResponse applyMomoCallback(Map<String, Object> payload) {
        String transactionCode = asString(payload.get("orderId"));
        if (!StringUtils.hasText(transactionCode)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Missing MOMO orderId");
        }
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Payment transaction not found"));
        Order order = transaction.getOrder();

        if (transaction.getStatus() == PaymentTransactionStatus.PAID) {
            return toCallbackResponse(order, transaction, "Payment already confirmed");
        }

        int resultCode = asInt(payload.get("resultCode"));
        boolean success = resultCode == 0;
        transaction.setGatewayResponse(momoGatewayClient.toJson(payload));
        if (success) {
            transaction.setStatus(PaymentTransactionStatus.PAID);
            transaction.setPaidAt(LocalDateTime.now());
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            transaction.setStatus(PaymentTransactionStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }
        paymentTransactionRepository.save(transaction);
        orderRepository.save(order);
        return toCallbackResponse(order, transaction, success ? "Payment success" : "Payment failed");
    }

    private void validateOrderForPayment(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Cannot pay a cancelled order");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Order is already paid");
        }
    }

    private String generateTransactionCode(PaymentMethod paymentMethod) {
        String prefix = paymentMethod.name();
        String code = prefix + "-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        while (paymentTransactionRepository.findByTransactionCode(code).isPresent()) {
            code = prefix + "-" + System.currentTimeMillis() + "-"
                    + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        return code;
    }

    private String resolveClientIp() {
        String forwarded = httpServletRequest.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return httpServletRequest.getRemoteAddr();
    }

    private PaymentCallbackResponse toCallbackResponse(Order order, PaymentTransaction transaction, String message) {
        PaymentCallbackResponse response = new PaymentCallbackResponse();
        response.setOrderId(order.getId());
        response.setTransactionCode(transaction.getTransactionCode());
        response.setTransactionStatus(transaction.getStatus());
        response.setOrderPaymentStatus(order.getPaymentStatus());
        response.setMessage(message);
        return response;
    }

    private int asInt(Object value) {
        try {
            return Integer.parseInt(asString(value));
        } catch (Exception exception) {
            return -1;
        }
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
