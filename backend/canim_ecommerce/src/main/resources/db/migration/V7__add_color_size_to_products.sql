-- V7__add_color_size_to_products.sql
alter table products 
add column color varchar(50), 
add column size varchar(50);