package com.example.canim_ecommerce.service.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Tạo URL ảnh QR VietQR động (số tiền + nội dung CK) qua dịch vụ img.vietqr.io.
 * Chuẩn NAPAS/VietQR — phù hợp tài khoản ngân hàng cá nhân và ví MoMo (mã acquirer cấu hình).
 */
@Component
public class VietQrUrlBuilder {

    static final String IMAGE_BASE = "https://img.vietqr.io/image/";

    public String buildImageUrl(
            String acquirerId,
            String accountNumber,
            String template,
            BigDecimal amountVnd,
            String transferContent,
            String accountName) {
        if (!StringUtils.hasText(acquirerId) || !StringUtils.hasText(accountNumber)) {
            return null;
        }
        String acq = acquirerId.trim();
        String account = accountNumber.replaceAll("\\s+", "");
        String tpl = StringUtils.hasText(template) ? template.trim() : "compact2";

        long amount = amountVnd.setScale(0, RoundingMode.HALF_UP).longValue();
        if (amount <= 0) {
            return null;
        }

        String path = acq + "-" + account + "-" + tpl + ".jpg";
        StringBuilder url = new StringBuilder(IMAGE_BASE).append(path);
        url.append("?amount=").append(amount);
        if (StringUtils.hasText(transferContent)) {
            url.append("&addInfo=").append(encode(transferContent.trim()));
        }
        if (StringUtils.hasText(accountName)) {
            url.append("&accountName=").append(encode(accountName.trim()));
        }
        return url.toString();
    }

    /** STK ví MoMo (BVBank) — thường bắt đầu 99MM, lấy trong app Nhận tiền. */
    public boolean isMomoVietQrWalletAccount(String walletAccountNumber) {
        if (!StringUtils.hasText(walletAccountNumber)) {
            return false;
        }
        String account = walletAccountNumber.replaceAll("\\s+", "").toUpperCase();
        if (account.length() < 14 || account.startsWith("PSP")) {
            return false;
        }
        if (account.matches("^0\\d{9,10}$")) {
            return false;
        }
        if (account.startsWith("99MM")) {
            return true;
        }
        return account.matches("^\\d{14,22}$") || account.matches("^[A-Z0-9]{14,}$");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
