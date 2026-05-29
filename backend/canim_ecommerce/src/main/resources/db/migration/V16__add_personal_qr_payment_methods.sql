-- Thanh toán QR ví cá nhân (MoMo / VNPay-VietQR) cho đồ án — không dùng API merchant
ALTER TABLE orders
    MODIFY COLUMN payment_method ENUM ('COD', 'VNPAY', 'MOMO', 'MOMO_QR', 'VNPAY_QR') DEFAULT 'COD';

ALTER TABLE payment_transactions
    MODIFY COLUMN payment_method ENUM ('COD', 'VNPAY', 'MOMO', 'MOMO_QR', 'VNPAY_QR') NOT NULL;
