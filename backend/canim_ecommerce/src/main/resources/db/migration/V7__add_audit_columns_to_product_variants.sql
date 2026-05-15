-- V7__add_audit_columns_to_product_variants.sql
ALTER TABLE product_variants
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;