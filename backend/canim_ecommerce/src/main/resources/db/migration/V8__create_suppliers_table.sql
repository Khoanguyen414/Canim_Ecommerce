DROP TABLE IF EXISTS supplier_product_price;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID duy nhất',
    supplier_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã nhà cung cấp (SUP_001)',
    name VARCHAR(255) NOT NULL COMMENT 'Tên nhà cung cấp',
    contact_name VARCHAR(200) COMMENT 'Tên người liên hệ',
    email VARCHAR(255) NOT NULL COMMENT 'Email liên hệ',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    address TEXT COMMENT 'Địa chỉ công ty',
    tax_id VARCHAR(50) COMMENT 'Mã số thuế',
    payment_terms VARCHAR(100) COMMENT 'Điều khoản thanh toán (NET30, COD, ADVANCE)',
    rating DECIMAL(3,1) DEFAULT 5.0 COMMENT 'Đánh giá (1.0-5.0)',
    total_orders INT DEFAULT 0 COMMENT 'Tổng số đơn hàng',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái (1=hoạt động, 0=xóa)',
    created_by BIGINT COMMENT 'User ID người tạo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    
    updated_by BIGINT COMMENT 'User ID người update gần nhất',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian update',

 
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_supplier_name (name),
    INDEX idx_supplier_status (is_active),
    INDEX idx_supplier_created_at (created_at)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Suppliers - Quản lý nhà cung cấp';


CREATE TABLE supplier_product_price (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID duy nhất',
    supplier_id BIGINT NOT NULL COMMENT 'ID nhà cung cấp',
    product_id BIGINT NOT NULL COMMENT 'ID sản phẩm',

    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Giá nhập cố định',
    effective_from DATE NOT NULL COMMENT 'Ngày bắt đầu áp dụng',
    effective_to DATE COMMENT 'Ngày kết thúc áp dụng (NULL = vô thời hạn)',

    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái (1=áp dụng, 0=không)',

    created_by BIGINT COMMENT 'User ID người tạo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',

    UNIQUE KEY uk_supplier_product (supplier_id, product_id) 
      COMMENT 'Mỗi (supplier, product) chỉ có 1 giá',
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_product_id (product_id),
    INDEX idx_effective_from (effective_from)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Supplier Product Price - Giá nhập theo nhà cung cấp';

