CREATE TABLE user_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    province_code VARCHAR(50) NULL,
    province_name VARCHAR(100) NULL,
    district_code VARCHAR(50) NULL,
    district_name VARCHAR(100) NULL,
    ward_code VARCHAR(50) NULL,
    ward_name VARCHAR(100) NULL,
    street_address VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    note VARCHAR(500) NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses (user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses (user_id, is_default);
CREATE INDEX idx_user_addresses_deleted ON user_addresses (user_id, is_deleted);

ALTER TABLE orders
    ADD COLUMN address_id BIGINT NULL,
    ADD COLUMN receiver_province_name VARCHAR(100) NULL,
    ADD COLUMN receiver_district_name VARCHAR(100) NULL,
    ADD COLUMN receiver_ward_name VARCHAR(100) NULL,
    ADD COLUMN receiver_street_address VARCHAR(255) NULL,
    ADD CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses (id) ON DELETE SET NULL;
