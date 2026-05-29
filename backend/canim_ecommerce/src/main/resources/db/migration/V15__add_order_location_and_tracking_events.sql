ALTER TABLE orders
ADD COLUMN receiver_latitude DECIMAL(10, 7) NULL AFTER shipping_address,
ADD COLUMN receiver_longitude DECIMAL(10, 7) NULL AFTER receiver_latitude,
ADD COLUMN map_url VARCHAR(1024) NULL AFTER receiver_longitude;

CREATE TABLE order_tracking_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    shipping_status ENUM(
        'NOT_SHIPPED',
        'WAITING_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'FAILED',
        'RETURNED',
        'CANCELLED'
    ) NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    location_label VARCHAR(255) NULL,
    note VARCHAR(500) NULL,
    created_by BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tracking_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_tracking_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_tracking_order ON order_tracking_events (order_id);
CREATE INDEX idx_tracking_status ON order_tracking_events (shipping_status);
CREATE INDEX idx_tracking_created_at ON order_tracking_events (created_at);
