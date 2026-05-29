-- Khách khai báo đã chuyển khoản QR; admin xác nhận mới chuyển sang PAID
ALTER TABLE orders
    MODIFY COLUMN payment_status ENUM (
        'UNPAID',
        'PENDING_CONFIRMATION',
        'PAID',
        'REFUNDED'
        ) DEFAULT 'UNPAID' NOT NULL;
