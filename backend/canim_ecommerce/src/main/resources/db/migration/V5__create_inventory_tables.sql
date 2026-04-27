-- V5__create_inventory_tables.sql
-- Mô tả: Khởi tạo hệ thống quản lý kho (WMS) - Thiết kế Đa kho, vận hành 1 kho.
CREATE TABLE IF NOT EXISTS warehouses (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    address    TEXT,
    is_active  TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO warehouses (id, name, address) VALUES (1, 'Kho Chính TP.HCM', 'Quận 1, TP.HCM');

CREATE TABLE IF NOT EXISTS suppliers (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    code           VARCHAR(50)  NOT NULL UNIQUE,
    name           VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(20)  NOT NULL,
    address        TEXT,
    is_active      TINYINT(1) DEFAULT 1,
    is_deleted     TINYINT(1) DEFAULT 0,
    created_by     BIGINT, 
    updated_by     BIGINT, 
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_reasons (
    code        VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    type        ENUM('INBOUND','OUTBOUND','ADJUST') NOT NULL,
    is_system   TINYINT(1) DEFAULT 1,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_batches (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id       BIGINT NOT NULL DEFAULT 1,
    variant_id         BIGINT NOT NULL,
    supplier_id        BIGINT,
    batch_code         VARCHAR(100) NOT NULL UNIQUE,
    sku_snapshot       VARCHAR(50), 
    quantity_remaining INT NOT NULL DEFAULT 0,
    import_price       DECIMAL(15,2) DEFAULT 0,
    expired_at         DATETIME NULL,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_batch_supplier  FOREIGN KEY (supplier_id)  REFERENCES suppliers (id),
    CONSTRAINT fk_batch_variant   FOREIGN KEY (variant_id)   REFERENCES product_variants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_batch_fifo ON inventory_batches (warehouse_id, variant_id, expired_at, created_at);

CREATE TABLE IF NOT EXISTS inventory_receipts (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id       BIGINT NOT NULL DEFAULT 1,
    receipt_code       VARCHAR(50) NOT NULL UNIQUE,
    type               ENUM('INBOUND','OUTBOUND') NOT NULL,
    reason_code        VARCHAR(50) NOT NULL,
    supplier_id        BIGINT NULL,
    order_id           BIGINT NULL,
    warehouse_staff_id BIGINT NULL, 
    status             ENUM('PENDING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    note               TEXT,
    is_deleted         TINYINT(1) DEFAULT 0,
    created_by         BIGINT,
    updated_by         BIGINT,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rc_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_rc_reason    FOREIGN KEY (reason_code)  REFERENCES inventory_reasons (code),
    CONSTRAINT fk_rc_supplier  FOREIGN KEY (supplier_id)  REFERENCES suppliers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_receipt_details (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL,
    batch_id   BIGINT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(15,2) NULL,
    CONSTRAINT fk_rd_receipt FOREIGN KEY (receipt_id) REFERENCES inventory_receipts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rd_batch   FOREIGN KEY (batch_id)   REFERENCES inventory_batches (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_checks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL DEFAULT 1,
    code         VARCHAR(50) NOT NULL UNIQUE,
    staff_id     BIGINT,
    status       VARCHAR(20) DEFAULT 'DRAFT',
    note         TEXT,
    created_by   BIGINT,
    updated_by   BIGINT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sc_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_check_details (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_id        BIGINT NOT NULL,
    variant_id      BIGINT NOT NULL,
    system_quantity INT NOT NULL,
    actual_quantity INT NOT NULL,
    reason          TEXT,
    CONSTRAINT fk_scd_check FOREIGN KEY (check_id) REFERENCES stock_checks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id   BIGINT NOT NULL DEFAULT 1,
    variant_id     BIGINT NOT NULL,
    batch_id       BIGINT NULL,
    type           ENUM('IN','OUT','ADJUST') NOT NULL,
    quantity       INT NOT NULL,
    reference_id   BIGINT, 
    reference_type VARCHAR(50),
    created_by     BIGINT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_it_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE inventory 
    DROP INDEX uq_inventory_variant,
    ADD COLUMN warehouse_id BIGINT NOT NULL DEFAULT 1 AFTER variant_id,
    ADD COLUMN min_stock INT DEFAULT 0 AFTER reserved,
    ADD CONSTRAINT uk_inv_wh_variant UNIQUE (variant_id, warehouse_id),
    ADD CONSTRAINT fk_inv_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT;

INSERT IGNORE INTO inventory_reasons (code, name, type, is_system) VALUES
('PURCHASE',          'Nhập hàng mua mới',     'INBOUND',  1),
('CUSTOMER_RETURN',   'Khách hàng trả hàng',   'INBOUND',  1),
('SALES_ORDER',       'Xuất kho bán hàng',     'OUTBOUND', 1),
('RETURN_TO_SUPPLIER', 'Trả hàng cho NCC',      'OUTBOUND', 1),
('DAMAGE',            'Hàng hư hỏng',          'ADJUST',   1),
('STOCKTAKE_ADJUST',  'Điều chỉnh sau kiểm kê', 'ADJUST',   1);