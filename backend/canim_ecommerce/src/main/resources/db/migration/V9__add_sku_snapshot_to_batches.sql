-- V9__add_sku_snapshot_to_batches.sql
ALTER TABLE inventory_batches
ADD COLUMN sku_snapshot VARCHAR(100) NULL AFTER product_id;