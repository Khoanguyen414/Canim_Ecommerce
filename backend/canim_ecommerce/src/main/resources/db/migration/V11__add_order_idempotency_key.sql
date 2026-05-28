ALTER TABLE orders
ADD COLUMN idempotency_key VARCHAR(100) NULL AFTER order_no;

CREATE UNIQUE INDEX uk_orders_user_id_idempotency_key ON orders (user_id, idempotency_key);
