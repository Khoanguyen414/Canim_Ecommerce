-- V3__seed_core_tables.sql
-- Roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

-- Categories
INSERT IGNORE INTO categories (id, name, slug, description) VALUES
(1, 'Thời trang Nam', 'thoi-trang-nam', 'Quần áo và phụ kiện cho nam'),
(2, 'Giày Dép', 'giay-dep', 'Các loại giày dép'),
(3, 'Phụ kiện', 'phu-kien', 'Túi xách, mũ, thắt lưng');

-- Products
INSERT IGNORE INTO products (id, name, slug, short_desc, brand, category_id) VALUES
(1, 'Áo Thun Basic', 'ao-thun-basic', 'Áo thun cotton basic', 'Local', 1),
(2, 'Giày Da Nam', 'giay-da-nam', 'Giày da công sở', 'BrandA', 2);

-- Product Variants
INSERT IGNORE INTO product_variants (id, product_id, sku, color, size, price) VALUES
(1, 1, 'ATBS-M-0', 'Đen', 'M', 150000),
(2, 1, 'ATBS-L-1', 'Trắng', 'L', 150000),
(3, 2, 'GDN-42-4', 'Nâu', '42', 550000);

-- Inventory
INSERT IGNORE INTO inventory (variant_id, quantity, reserved) VALUES
(1, 50, 0),
(2, 30, 0),
(3, 15, 0);