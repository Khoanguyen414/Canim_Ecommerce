-- ============================================================================
-- Flyway Migration V8: Create Suppliers Table & Related
-- Purpose: Quản lý Nhà Cung Cấp (Supplier Management)
-- Author: Team
-- Date: 2025-01-01
-- ============================================================================

-- ============================================================================
-- TABLE 1: SUPPLIERS - Nhà Cung Cấp
-- ============================================================================
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
    -- ====== PRIMARY KEY ======
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID duy nhất',
    
    -- ====== BASIC INFO - Thông Tin Cơ Bản ======
    supplier_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã nhà cung cấp (SUP_001, SUP_002)',
    name VARCHAR(255) NOT NULL COMMENT 'Tên nhà cung cấp',
    
    -- ====== CONTACT INFO - Thông Tin Liên Hệ ======
    contact_name VARCHAR(200) COMMENT 'Tên người liên hệ',
    email VARCHAR(255) NOT NULL COMMENT 'Email liên hệ',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    address TEXT COMMENT 'Địa chỉ công ty',
    
    -- ====== BUSINESS INFO - Thông Tin Kinh Doanh ======
    tax_id VARCHAR(50) COMMENT 'Mã số thuế',
    payment_terms VARCHAR(100) COMMENT 'Điều khoản thanh toán (NET30, COD, ADVANCE)',
    
    -- ====== PERFORMANCE - Đánh Giá & Thống Kê ======
    rating DECIMAL(2,1) DEFAULT 5.0 COMMENT 'Đánh giá (1.0-5.0)',
    total_orders INT DEFAULT 0 COMMENT 'Tổng số đơn đã mua',
    
    -- ====== STATUS - Trạng Thái ======
    is_active TINYINT(1) DEFAULT 1 COMMENT '1: Active, 0: Soft Delete',
    
    -- ====== AUDIT TRAIL - Ghi Chú Audit ======
    created_by INT COMMENT 'User ID tạo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_by INT COMMENT 'User ID update gần nhất',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian update',
    
    -- ====== FOREIGN KEYS ======
    CONSTRAINT fk_supplier_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_supplier_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- ====== INDEXES - Tối ưu truy vấn ======
    INDEX idx_supplier_code (supplier_code) COMMENT 'Index cho findBySupplierCode',
    INDEX idx_supplier_name (name) COMMENT 'Index cho search by name',
    INDEX idx_supplier_status (is_active) COMMENT 'Index cho findByIsActiveTrue',
    INDEX idx_supplier_created_at (created_at) COMMENT 'Index cho audit trail'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Quản lý thông tin nhà cung cấp hàng hóa';

-- ============================================================================
-- TABLE 2: SUPPLIER_PRODUCT_PRICE - Giá Nhập Cố Định (Fixed Price Config)
-- ============================================================================
DROP TABLE IF EXISTS supplier_product_price;

CREATE TABLE supplier_product_price (
    -- ====== PRIMARY KEY ======
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID duy nhất',
    
    -- ====== FOREIGN KEYS ======
    supplier_id INT NOT NULL COMMENT 'Nhà cung cấp',
    product_id INT NOT NULL COMMENT 'Sản phẩm',
    
    -- ====== PRICE INFO ======
    unit_price DECIMAL(10,2) NOT NULL COMMENT 'Giá nhập cố định (Fixed price)',
    effective_from DATE NOT NULL COMMENT 'Ngày bắt đầu áp dụng',
    effective_to DATE COMMENT 'Ngày kết thúc áp dụng (NULL = vô thời hạn)',
    is_active TINYINT(1) DEFAULT 1 COMMENT '1: Áp dụng, 0: Không áp dụng',
    
    -- ====== AUDIT ======
    created_by INT COMMENT 'User tạo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    
    -- ====== CONSTRAINTS & INDEXES ======
    CONSTRAINT fk_sup_price_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    CONSTRAINT fk_sup_price_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_sup_price_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_supplier_product (supplier_id, product_id) COMMENT 'Mỗi (supplier, product) chỉ có 1 giá',
    INDEX idx_supplier_id (supplier_id) COMMENT 'Index cho search by supplier',
    INDEX idx_product_id (product_id) COMMENT 'Index cho search by product',
    INDEX idx_effective_from (effective_from) COMMENT 'Index cho date range query'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cấu hình giá nhập cố định cho mỗi nhà cung cấp';

-- ============================================================================
-- SAMPLE DATA - Dữ Liệu Mẫu (For Testing)
-- ============================================================================

INSERT INTO suppliers (supplier_code, name, contact_name, email, phone, address, tax_id, payment_terms, rating, created_by)
VALUES 
(
    'SUP_001',
    'Công Ty Cộng Phần Cung Cấp Hàng A',
    'Nguyễn Văn A',
    'contact@supplier-a.com',
    '0901234567',
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    '0123456789',
    'NET30',
    5.0,
    1
),
(
    'SUP_002',
    'Công Ty Cộng Phần Cung Cấp Hàng B',
    'Trần Thị B',
    'contact@supplier-b.com',
    '0987654321',
    '456 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
    '0987654321',
    'COD',
    4.5,
    1
),
(
    'SUP_003',
    'Công Ty Cộng Phần Cung Cấp Hàng C',
    'Phạm Văn C',
    'contact@supplier-c.com',
    '0912345678',
    '789 Đường Lê Lợi, Quận 1, TP.HCM',
    '0912345678',
    'ADVANCE',
    4.0,
    1
);

-- ============================================================================
-- COMMENTS & EXPLANATIONS
-- ============================================================================

/*
DATABASE DESIGN NOTES:

1. SUPPLIERS TABLE:
   - supplier_code: UNIQUE (không trùng lặp)
   - email: NOT NULL (cần để gửi PO)
   - is_active: TINYINT(1) (soft delete)
   - rating: DECIMAL(2,1) (2 total digits, 1 decimal: 5.0)
   - createdBy, updatedBy: Track audit trail
   - Indexes on code, name, status (truy vấn nhanh)

2. SUPPLIER_PRODUCT_PRICE TABLE:
   - Fixed Price Configuration
   - UNIQUE (supplier_id, product_id): Mỗi supplier có 1 giá cho 1 product
   - effective_from/to: Date range validation
   - is_active: Retire old prices without delete
   - Benefit: Can have multiple prices (history), but only 1 active

3. SAMPLE DATA:
   - 3 suppliers for testing
   - Different payment terms (NET30, COD, ADVANCE)
   - Different ratings (5.0, 4.5, 4.0)

4. INDEXES:
   - supplier_code: FOR findBySupplierCode() query
   - is_active: FOR findByIsActiveTrue() query
   - name: FOR search by name
   - created_at: FOR audit trail reports

5. CHARACTER SET:
   - utf8mb4: Support Tiếng Việt + Emoji
   - collate utf8mb4_unicode_ci: Case-insensitive compare

6. FOREIGN KEYS:
   - created_by, updated_by → users(id) ON DELETE SET NULL
   - If user deleted, supplier still exists (null user_id)

7. SOFT DELETE STRATEGY:
   - is_active = 0: Mark as deleted
   - is_active = 1: Active
   - Always query: WHERE is_active = 1
   - Data never lost, audit trail preserved
*/

COMMIT;