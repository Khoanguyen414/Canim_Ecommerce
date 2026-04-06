-- V5__create_inventory_tables.sql
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    is_active TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_reasons (
    code VARCHAR(50) PRIMARY KEY,
    type ENUM('INBOUND', 'OUTBOUND', 'ADJUST') NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL,
    batch_code VARCHAR(100) NOT NULL,
    sku_snapshot VARCHAR(50), 
    quantity_remaining INT NOT NULL DEFAULT 0 CHECK (quantity_remaining >= 0), 
    import_price DECIMAL(15, 2) DEFAULT 0,
    expired_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_warehouse_batch (warehouse_id, batch_code), 
    CONSTRAINT fk_batch_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_batch_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_batch_fifo_pro ON inventory_batches (warehouse_id, variant_id, expired_at, created_at);

CREATE TABLE IF NOT EXISTS inventory_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    receipt_code VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    reason_code VARCHAR(50) NOT NULL, 
    supplier_id BIGINT NULL,
    order_id BIGINT NULL COMMENT 'Used for SALES_ORDER or CUSTOMER_RETURN',
    warehouse_staff_id BIGINT,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    note TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_by BIGINT,
    updated_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_receipt_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_receipt_reason FOREIGN KEY (reason_code) REFERENCES inventory_reasons (code),
    CONSTRAINT fk_receipt_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_receipt_staff FOREIGN KEY (warehouse_staff_id) REFERENCES users (id),
    CONSTRAINT fk_receipt_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_receipt_lookup ON inventory_receipts (warehouse_id, type, status);
CREATE INDEX idx_receipt_created_at ON inventory_receipts (created_at);

CREATE TABLE IF NOT EXISTS inventory_receipt_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL, 
    batch_id BIGINT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NULL, 
    
    CONSTRAINT fk_ird_receipt FOREIGN KEY (receipt_id) REFERENCES inventory_receipts (id) ON DELETE CASCADE,
    CONSTRAINT fk_ird_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id),
    CONSTRAINT fk_ird_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ird_receipt ON inventory_receipt_details (receipt_id);
CREATE INDEX idx_ird_variant ON inventory_receipt_details (variant_id);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL,
    batch_id BIGINT NULL,
    type ENUM('IN', 'OUT', 'ADJUST') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0), 
    reference_id BIGINT, 
    reference_type VARCHAR(50),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_it_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_it_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id),
    CONSTRAINT fk_it_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (id),
    CONSTRAINT fk_it_user FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_it_variant_time ON inventory_transactions (variant_id, created_at);
CREATE INDEX idx_it_created_at ON inventory_transactions (created_at);

CREATE TABLE IF NOT EXISTS stock_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    staff_id BIGINT,
    status ENUM('DRAFT', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    note TEXT,
    created_by BIGINT,
    updated_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_check_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_check_staff FOREIGN KEY (staff_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_check_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL, 
    system_quantity INT NOT NULL,
    actual_quantity INT NOT NULL,
    difference INT GENERATED ALWAYS AS (actual_quantity - system_quantity) STORED, 
    reason TEXT,
    
    CONSTRAINT fk_scd_check FOREIGN KEY (check_id) REFERENCES stock_checks (id) ON DELETE CASCADE,
    CONSTRAINT fk_scd_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_scd_variant ON stock_check_details (variant_id);

ALTER TABLE inventory ADD COLUMN min_stock INT DEFAULT 0;

-- SEED DATA
INSERT IGNORE INTO warehouses (id, name, address) VALUES (1, 'Kho Chính TP.HCM', 'Quận 1, TP.HCM');
INSERT IGNORE INTO inventory_reasons (code, type, description) VALUES
('PURCHASE', 'INBOUND', 'Nhập hàng mua mới'),
('CUSTOMER_RETURN', 'INBOUND', 'Khách hàng trả hàng'),
('SALES_ORDER', 'OUTBOUND', 'Xuất kho bán hàng'),
('RETURN_TO_SUPPLIER', 'OUTBOUND', 'Trả hàng cho NCC'),
('DAMAGE', 'ADJUST', 'Hàng hư hỏng'),
('STOCKTAKE_ADJUST', 'ADJUST', 'Điều chỉnh sau kiểm kê');

