-- V10__normalize_product_brand_color_size.sql
-- 1. Create brands table
create table if not exists brands (
    id bigint auto_increment primary key,
    name varchar(100) not null unique
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 2. Create colors table
create table if not exists colors (
    id bigint auto_increment primary key,
    name varchar(50) not null unique
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 3. Create sizes table
create table if not exists sizes (
    id bigint auto_increment primary key,
    name varchar(50) not null unique
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 4. Alter products table: remove brand, color, size columns, add foreign keys
alter table products
    drop column if exists brand,
    drop column if exists color,
    drop column if exists size,
    add column brand_id bigint,
    add column color_id bigint,
    add column size_id bigint,
    add constraint fk_product_brand foreign key (brand_id) references brands(id) on delete set null,
    add constraint fk_product_color foreign key (color_id) references colors(id) on delete set null,
    add constraint fk_product_size foreign key (size_id) references sizes(id) on delete set null;