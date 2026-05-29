package com.example.canim_ecommerce.service.payment;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.config.PaymentProperties;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MomoGatewayClient {
    static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    PaymentProperties paymentProperties;
    HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> createPayment(String transactionCode, BigDecimal amount) {
        PaymentProperties.Momo cfg = paymentProperties.getMomo();
        if (!cfg.isEnabled()) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "MOMO payment is disabled");
        }
        if (!StringUtils.hasText(cfg.getPartnerCode())
                || !StringUtils.hasText(cfg.getAccessKey())
                || !StringUtils.hasText(cfg.getSecretKey())) {
            throw new ApiException(
                    ApiStatus.INTERNAL_SERVER_ERROR,
                    "MOMO chưa cấu hình: đặt MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY");
        }

        String requestId = transactionCode + "-REQ";
        String amountText = amount.setScale(0, java.math.RoundingMode.HALF_UP).toPlainString();
        String orderInfo = "Thanh toan don hang " + transactionCode;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", cfg.getPartnerCode());
        payload.put("accessKey", cfg.getAccessKey());
        payload.put("requestId", requestId);
        payload.put("amount", amountText);
        payload.put("orderId", transactionCode);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", cfg.getReturnUrl());
        payload.put("ipnUrl", cfg.getNotifyUrl());
        payload.put("requestType", "captureWallet");
        payload.put("extraData", "");
        payload.put("lang", "vi");

        String rawSignature = "accessKey=" + cfg.getAccessKey()
                + "&amount=" + amountText
                + "&extraData="
                + "&ipnUrl=" + cfg.getNotifyUrl()
                + "&orderId=" + transactionCode
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + cfg.getPartnerCode()
                + "&redirectUrl=" + cfg.getReturnUrl()
                + "&requestId=" + requestId
                + "&requestType=captureWallet";
        payload.put("signature", sign(rawSignature, cfg.getSecretKey()));

        String endpoint = paymentProperties.resolvedMomoEndpoint();
        log.info(
                "MOMO create payment [{}] endpoint={} amount={}",
                paymentProperties.getEnvironment(),
                endpoint,
                amountText);

        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> result = objectMapper.readValue(response.body(), MAP_TYPE);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(
                        ApiStatus.BAD_REQUEST,
                        "MOMO HTTP " + response.statusCode() + ": " + asString(result.get("message")));
            }
            int resultCode = asInt(result.get("resultCode"));
            if (resultCode != 0) {
                throw new ApiException(
                        ApiStatus.BAD_REQUEST,
                        "MOMO từ chối (resultCode="
                                + resultCode
                                + "): "
                                + asString(result.get("message")));
            }
            return result;
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Không gọi được cổng MOMO: " + exception.getMessage());
        }
    }

    public boolean verifyCallbackSignature(Map<String, Object> payload) {
        PaymentProperties.Momo cfg = paymentProperties.getMomo();
        String callbackSignature = asString(payload.get("signature"));
        if (!StringUtils.hasText(callbackSignature)) {
            return false;
        }
        String rawSignature = "accessKey=" + cfg.getAccessKey()
                + "&amount=" + asString(payload.get("amount"))
                + "&extraData=" + asString(payload.get("extraData"))
                + "&message=" + asString(payload.get("message"))
                + "&orderId=" + asString(payload.get("orderId"))
                + "&orderInfo=" + asString(payload.get("orderInfo"))
                + "&orderType=" + asString(payload.get("orderType"))
                + "&partnerCode=" + asString(payload.get("partnerCode"))
                + "&payType=" + asString(payload.get("payType"))
                + "&requestId=" + asString(payload.get("requestId"))
                + "&responseTime=" + asString(payload.get("responseTime"))
                + "&resultCode=" + asString(payload.get("resultCode"))
                + "&transId=" + asString(payload.get("transId"));
        String expected = sign(rawSignature, cfg.getSecretKey());
        return callbackSignature.equals(expected);
    }

    public String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return payload.entrySet()
                    .stream()
                    .map(entry -> "\"" + entry.getKey() + "\":\"" + asString(entry.getValue()) + "\"")
                    .collect(Collectors.joining(",", "{", "}"));
        }
    }

    private String sign(String raw, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] bytes = mac.doFinal(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte item : bytes) {
                builder.append(String.format("%02x", item));
            }
            return builder.toString();
        } catch (Exception exception) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Cannot sign MOMO request");
        }
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
