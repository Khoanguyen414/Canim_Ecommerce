package com.example.canim_ecommerce.enums;

public enum PaymentMethod {
    COD,
    VNPAY,
    MOMO,
    /** Quét mã QR MoMo cá nhân (chuyển khoản thủ công, xác nhận bởi shop). */
    MOMO_QR,
    /** Quét VietQR / VNPay cá nhân (chuyển khoản thủ công, xác nhận bởi shop). */
    VNPAY_QR
}
