package com.example.canim_ecommerce.service.payment;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.config.PaymentProperties;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VnpayGatewayClient {
    static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    static final ZoneId TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    PaymentProperties paymentProperties;

    public String createPaymentUrl(String transactionCode, BigDecimal amount, String clientIp) {
        PaymentProperties.Vnpay cfg = paymentProperties.getVnpay();
        if (!cfg.isEnabled()) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "VNPAY payment is disabled");
        }
        if (!StringUtils.hasText(cfg.getTmnCode()) || !StringUtils.hasText(cfg.getHashSecret())) {
            throw new ApiException(
                    ApiStatus.INTERNAL_SERVER_ERROR,
                    "VNPAY chưa cấu hình: đặt VNPAY_TMN_CODE và VNPAY_HASH_SECRET (merchant VNPay)");
        }

        long amountForGateway = amount.movePointRight(2).longValue();
        LocalDateTime now = LocalDateTime.now(TIME_ZONE);
        LocalDateTime expireAt = now.plusMinutes(15);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", cfg.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amountForGateway));
        params.put("vnp_CreateDate", now.format(DATE_TIME_FORMAT));
        params.put("vnp_ExpireDate", expireAt.format(DATE_TIME_FORMAT));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", StringUtils.hasText(clientIp) ? clientIp : "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", "Thanh toan don hang " + transactionCode);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", cfg.getReturnUrl());
        if (StringUtils.hasText(cfg.getIpnUrl())) {
            params.put("vnp_IpnUrl", cfg.getIpnUrl());
        }
        params.put("vnp_TxnRef", transactionCode);

        String query = toSortedQuery(params);
        String signature = sign(query, cfg.getHashSecret());
        String payUrl = paymentProperties.resolvedVnpayPayUrl();
        log.info(
                "VNPAY create payment [{}] amount={} returnUrl={}",
                paymentProperties.getEnvironment(),
                amount,
                cfg.getReturnUrl());
        return payUrl + "?" + query + "&vnp_SecureHash=" + signature;
    }

    public boolean verifySignature(Map<String, String> params) {
        String hashSecret = paymentProperties.getVnpay().getHashSecret();
        String received = params.get("vnp_SecureHash");
        if (!StringUtils.hasText(received) || !StringUtils.hasText(hashSecret)) {
            return false;
        }
        Map<String, String> input = new HashMap<>(params);
        input.remove("vnp_SecureHash");
        input.remove("vnp_SecureHashType");
        String query = toSortedQuery(input);
        String expected = sign(query, hashSecret);
        return received.equalsIgnoreCase(expected);
    }

    public String toJson(Map<String, String> params) {
        return params.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> "\"" + entry.getKey() + "\":\"" + entry.getValue() + "\"")
                .collect(Collectors.joining(",", "{", "}"));
    }

    private String toSortedQuery(Map<String, String> params) {
        Map<String, String> sorted = new TreeMap<>(params);
        return sorted.entrySet()
                .stream()
                .filter(entry -> StringUtils.hasText(entry.getValue()))
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String sign(String payload, String hashSecret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec key = new SecretKeySpec(hashSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(key);
            byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte item : bytes) {
                builder.append(String.format("%02x", item));
            }
            return builder.toString();
        } catch (Exception exception) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Cannot sign VNPAY request");
        }
    }
}
