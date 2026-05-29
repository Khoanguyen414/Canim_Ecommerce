package com.example.canim_ecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

/**
 * Thông tin hiển thị khi thanh toán QR cá nhân (đồ án).
 * Ảnh QR đặt ở frontend: {@code frontend/public/qr/}.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "payment.personal-qr")
public class PersonalQrProperties {

    private final Momo momo = new Momo();
    private final Vnpay vnpay = new Vnpay();

    /** compact | compact2 | qr_only | print */
    private String vietqrTemplate = "compact2";

    @Getter
    @Setter
    public static class Momo {
        private boolean enabled = true;
        private String accountName = "Ten chu vi MoMo";
        private String phone = "09xxxxxxxx";
        /**
         * STK ví MoMo (BVBank) — lấy trong app MoMo → Nhận tiền → sao chép STK đầy đủ (vd. 99MM...).
         * Không dùng số điện thoại thay cho trường này.
         */
        private String walletAccountNumber = "";
        /** Mã NAPAS BVBank (MoMo VietQR) = 970454 */
        private String vietqrBankBin = "970454";
        @Deprecated
        private String vietqrAcquirerId = "970454";
    }

    @Getter
    @Setter
    public static class Vnpay {
        private boolean enabled = true;
        private String accountName = "Ten chu tai khoan";
        private String bankName = "Ngan hang";
        private String accountNumber = "xxxxxxxxxxxx";
        /** Mã NAPAS ngân hàng, VD Vietcombank = 970436. */
        private String vietqrAcquirerId = "970436";
    }
}
