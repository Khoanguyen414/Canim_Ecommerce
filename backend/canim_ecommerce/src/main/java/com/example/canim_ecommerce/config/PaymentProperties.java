package com.example.canim_ecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import lombok.Getter;
import lombok.Setter;

/**
 * Cấu hình cổng thanh toán. Đặt {@code payment.environment=production} và credentials thật
 * từ merchant VNPay / MoMo (không commit secret vào git).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {

    /**
     * {@code sandbox} — test gateway; {@code production} — tiền thật.
     */
    private String environment = "sandbox";

    private final Vnpay vnpay = new Vnpay();
    private final Momo momo = new Momo();

    public boolean isProduction() {
        return "production".equalsIgnoreCase(environment);
    }

    public String resolvedVnpayPayUrl() {
        if (StringUtils.hasText(vnpay.payUrl)) {
            return vnpay.payUrl;
        }
        return isProduction()
                ? "https://pay.vnpayment.vn/paymentv2/vpcpay.html"
                : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    }

    public String resolvedMomoEndpoint() {
        if (StringUtils.hasText(momo.endpoint)) {
            return momo.endpoint;
        }
        return isProduction()
                ? "https://payment.momo.vn/v2/gateway/api/create"
                : "https://test-payment.momo.vn/v2/gateway/api/create";
    }

    @Getter
    @Setter
    public static class Vnpay {
        private boolean enabled = true;
        private String tmnCode = "";
        private String hashSecret = "";
        private String payUrl = "";
        private String returnUrl = "http://localhost:5173/payment/vnpay-return";
        private String ipnUrl = "http://localhost:8000/canim_ecommerce/payments/vnpay/ipn";
    }

    @Getter
    @Setter
    public static class Momo {
        private boolean enabled = true;
        private String partnerCode = "";
        private String accessKey = "";
        private String secretKey = "";
        private String endpoint = "";
        private String returnUrl = "http://localhost:5173/payment/momo-return";
        private String notifyUrl = "http://localhost:8000/canim_ecommerce/payments/momo/notify";
    }
}
