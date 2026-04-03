-- V10__refactor_product_and_create_variants.sql
-- 1. Create product_variants table
create table
    if not exists product_variants (
        id bigint auto_increment primary key,
        product_id bigint not null,
        sku varchar(100) not null unique,
        color varchar(50),
        size varchar(50),
        price decimal(15, 2) not null,
        created_at datetime default current_timestamp,
        updated_at datetime default current_timestamp on update current_timestamp,
        constraint fk_variant_product foreign key (product_id) references products (id) on delete cascade
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

-- 2. Data Migration
insert into
    product_variants (product_id, sku, price)
select
    id,
    sku,
    price
from
    products wwhere sku is not null;

-- 3. Clean up the products table (Delete columns)
after table products
drop column sku,
drop column price,
drop column color,
drop column size;