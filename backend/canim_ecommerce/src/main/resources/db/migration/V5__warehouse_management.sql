-- V5__warehouse_management.sql
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS inventory_batches (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        variant_id BIGINT NOT NULL,
        batch_code VARCHAR(100) NOT NULL,
        sku_snapshot VARCHAR(50),
        quantity_remaining INT NOT NULL DEFAULT 0,
        import_price DECIMAL(15, 2) DEFAULT 0,
        expired_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_batch_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_batch_variant_date ON inventory_batches (variant_id, created_at);

CREATE TABLE
    IF NOT EXISTS inventory_receipts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        receipt_code VARCHAR(50) NOT NULL UNIQUE,
        type ENUM ('INBOUND', 'OUTBOUND') NOT NULL,
        reason ENUM (
            'PURCHASE',
            'RETURN_TO_SUPPLIER',
            'SALES_ORDER',
            'DAMAGE',
            'STOCKTAKE_ADJUST'
        ) NOT NULL,
        supplier_id BIGINT NULL,
        order_id BIGINT NULL,
        warehouse_staff_id BIGINT,
        status ENUM ('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_receipt_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
        CONSTRAINT fk_receipt_order FOREIGN KEY (order_id) REFERENCES orders (id),
        CONSTRAINT fk_receipt_staff FOREIGN KEY (warehouse_staff_id) REFERENCES users (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS inventory_receipt_details (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        receipt_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        batch_id BIGINT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        price DECIMAL(15, 2) NOT NULL,
        CONSTRAINT fk_ird_receipt FOREIGN KEY (receipt_id) REFERENCES inventory_receipts (id) ON DELETE CASCADE,
        CONSTRAINT fk_ird_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id),
        CONSTRAINT fk_ird_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS stock_checks (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        staff_id BIGINT,
        check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM ('DRAFT', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_check_staff FOREIGN KEY (staff_id) REFERENCES users (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS stock_check_details (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        check_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        system_quantity INT NOT NULL,
        actual_quantity INT NOT NULL,
        difference INT,
        reason TEXT,
        CONSTRAINT fk_scd_check FOREIGN KEY (check_id) REFERENCES stock_checks (id) ON DELETE CASCADE,
        CONSTRAINT fk_scd_product FOREIGN KEY (product_id) REFERENCES products (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Thêm quyền hạn Kho
INSERT IGNORE INTO permissions (name, description)
VALUES
    ('SUPPLIER_READ', 'Xem nhà cung cấp'),
    ('SUPPLIER_MANAGE', 'Thêm sửa xóa nhà cung cấp'),
    ('WAREHOUSE_READ', 'Xem tồn kho và lịch sử'),
    ('WAREHOUSE_IMPORT', 'Tạo phiếu nhập kho'),
    ('WAREHOUSE_EXPORT', 'Tạo phiếu xuất kho'),
    ('WAREHOUSE_STOCKTAKE', 'Thực hiện kiểm kê');

-- Gán quyền cho ADMIN
INSERT IGNORE INTO roles (name) VALUES ('ROLE_WAREHOUSE');

-- Gán quyền cho WAREHOUSE (Fix lỗi igmore)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name IN ('ROLE_ADMIN', 'ROLE_WAREHOUSE')
    AND p.name IN ('SUPPLIER_READ', 'SUPPLIER_MANAGE', 'WAREHOUSE_READ', 'WAREHOUSE_IMPORT', 'WAREHOUSE_EXPORT', 'WAREHOUSE_STOCKTAKE');