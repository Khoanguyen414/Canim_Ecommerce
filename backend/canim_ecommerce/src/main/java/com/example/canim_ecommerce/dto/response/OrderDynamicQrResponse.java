package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;

import com.example.canim_ecommerce.enums.PaymentMethod;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDynamicQrResponse {
    Long orderId;
    String orderNo;
    PaymentMethod paymentMethod;
    BigDecimal amount;
    String transferContent;
    String accountName;
    /** SĐT MoMo hoặc STK ngân hàng hiển thị cho khách. */
    String accountNumber;
    String bankName;
    /** URL ảnh QR (ngân hàng qua img.vietqr.io). MoMo dùng qrPayload + render client. */
    String dynamicQrImageUrl;
    /** Chuỗi EMV VietQR — frontend render QR (MoMo). */
    String qrPayload;
    String walletAccountNumber;
    String vietqrBankBin;
    boolean momoWalletConfigured;
}
