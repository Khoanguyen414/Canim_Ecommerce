-- V9__add_sku_snapshot_to_batches.sql
after table inventory_batches
add column sku_snapshot varchar(50) null after product_id;