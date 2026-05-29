package com.example.canim_ecommerce.enums;

public enum PaymentStatus {
    UNPAID,
    /** Khách đã khai báo chuyển khoản QR — chờ admin đối soát. */
    PENDING_CONFIRMATION,
    PAID,
    REFUNDED
}
