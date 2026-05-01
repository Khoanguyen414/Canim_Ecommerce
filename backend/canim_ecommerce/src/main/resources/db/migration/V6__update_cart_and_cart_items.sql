-- V6__update_cart_and_cart_items.sql
ALTER TABLE cart_items 
ADD COLUMN is_selected BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE carts 
ADD COLUMN version BIGINT DEFAULT 0;