CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_method ENUM('COD', 'VNPAY', 'MOMO') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(100) NULL,
    gateway_response JSON NULL,
    paid_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_transactions_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions (order_id);

CREATE INDEX idx_payment_transactions_transaction_code ON payment_transactions (transaction_code);

CREATE INDEX idx_payment_transactions_status ON payment_transactions (status);

CREATE INDEX idx_payment_transactions_method ON payment_transactions (payment_method);
