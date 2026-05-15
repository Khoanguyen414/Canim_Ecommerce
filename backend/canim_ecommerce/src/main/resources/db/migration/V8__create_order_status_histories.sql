-- V8__create_order_status_histories.sql
-- Add added_at column to order_items
ALTER TABLE order_items
ADD COLUMN added_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create order_status_histories table
CREATE TABLE
    IF NOT EXISTS order_status_histories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        from_status VARCHAR(50),
        to_status VARCHAR(50) NOT NULL,
        reason TEXT,
        created_by BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Indexes for order_status_histories
CREATE INDEX idx_order_status_histories_order_id ON order_status_histories (order_id);

CREATE INDEX idx_order_status_histories_created_at ON order_status_histories (created_at);