-- V3__seed_core_tables.sql
-- Roles
insert ignore into roles (name) values ('ROLE_USER'), ('ROLE_ADMIN');

-- Categories
insert ignore into categories (name, slug, description)
values ('Thời trang Nam', 'thoi-trang-nam', 'Quần áo và phụ kiện cho nam'),
       ('Giày Dép', 'giay-dep', 'Các loại giày dép'),
       ('Phụ kiện', 'phu-kien', 'Túi xách, mũ, thắt lưng');

-- Products (minimal)
insert ignore into products (sku, name, slug, short_desc, price, brand, category_id)
values
('SKU-TS-001','Áo Thun Basic','ao-thun-basic','Áo thun cotton basic',199000,'Local', (select id from categories where slug='thoi-trang-nam' LIMIT 1)),
('SKU-G-001','Giày Da Nam','giay-da-nam','Giày da công sở',799000,'BrandA', (select id from categories where slug='giay-dep' LIMIT 1)),
('SKU-G-002','Giày Sneaker','giay-sneaker','Giày thể thao',599000,'BrandB', (select id from categories where slug='giay-dep' LIMIT 1)),
('SKU-PK-001','Túi Đeo Chéo','tui-deo-cheo','Túi vải thời trang',350000,'BrandC', (select id from categories where slug='phu-kien' LIMIT 1)),
('SKU-TS-002','Áo Polo','ao-polo','Áo polo thoáng mát',299000,'Local', (select id from categories where slug='thoi-trang-nam' LIMIT 1));

-- Inventory
insert ignore into inventory (product_id, sku, quantity, reserved)
select id, sku, 50, 0 FROM products LIMIT 5;
