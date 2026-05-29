-- V9__upgrade_order_metadata_and_snapshots.sql
-- Add new columns to orders for enhanced tracking and metadata
ALTER TABLE orders
ADD COLUMN confirmed_at DATETIME NULL AFTER order_status,
ADD COLUMN shipped_at DATETIME NULL AFTER confirmed_at,
ADD COLUMN delivered_at DATETIME NULL AFTER shipped_at,
ADD COLUMN cancelled_at DATETIME NULL AFTER delivered_at,
ADD COLUMN cancel_reason VARCHAR(500) NULL AFTER cancelled_at,
ADD COLUMN cancelled_by BIGINT NULL AFTER cancel_reason,
ADD COLUMN shipping_provider VARCHAR(100) NULL AFTER cancelled_by,
ADD COLUMN tracking_code VARCHAR(100) NULL AFTER shipping_provider,
ADD COLUMN shipping_status ENUM (
    'NOT_SHIPPED',
    'WAITING_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'RETURNED',
    'CANCELLED'
) DEFAULT 'NOT_SHIPPED' AFTER tracking_code;

-- Add foreign key constraint for cancelled_by to reference users table
ALTER TABLE orders ADD CONSTRAINT fk_orders_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users (id) ON DELETE SET NULL;

-- Add snapshot columns to order_items to capture product details at the time of order
ALTER TABLE order_items
ADD COLUMN sku_snapshot VARCHAR(100) NULL AFTER variant_id,
ADD COLUMN product_name_snapshot VARCHAR(255) NULL AFTER sku_snapshot,
ADD COLUMN image_url_snapshot VARCHAR(1024) NULL AFTER product_name_snapshot;

-- Create indexes for orders to optimize queries based on status and tracking
CREATE INDEX idx_orders_order_status ON orders (order_status);

CREATE INDEX idx_orders_payment_status ON orders (payment_status);

CREATE INDEX idx_orders_shipping_status ON orders (shipping_status);

CREATE INDEX idx_orders_tracking_code ON orders (tracking_code);

CREATE INDEX idx_orders_cancelled_by ON orders (cancelled_by);