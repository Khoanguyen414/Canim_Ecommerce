-- Drop legacy `cart_items.product_id` column if it exists.
-- Current cart model persists by `variant_id` only.

SET @schema_name := DATABASE();

-- Drop FK on product_id if present.
SET @fk_name := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = @schema_name
      AND kcu.TABLE_NAME = 'cart_items'
      AND kcu.COLUMN_NAME = 'product_id'
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_fk_sql := IF(
    @fk_name IS NOT NULL,
    CONCAT('ALTER TABLE cart_items DROP FOREIGN KEY ', @fk_name),
    'SELECT 1'
);
PREPARE stmt_drop_fk FROM @drop_fk_sql;
EXECUTE stmt_drop_fk;
DEALLOCATE PREPARE stmt_drop_fk;

-- Drop non-primary index on product_id if present.
SET @idx_name := (
    SELECT s.INDEX_NAME
    FROM information_schema.STATISTICS s
    WHERE s.TABLE_SCHEMA = @schema_name
      AND s.TABLE_NAME = 'cart_items'
      AND s.COLUMN_NAME = 'product_id'
      AND s.INDEX_NAME <> 'PRIMARY'
    LIMIT 1
);

SET @drop_idx_sql := IF(
    @idx_name IS NOT NULL,
    CONCAT('ALTER TABLE cart_items DROP INDEX ', @idx_name),
    'SELECT 1'
);
PREPARE stmt_drop_idx FROM @drop_idx_sql;
EXECUTE stmt_drop_idx;
DEALLOCATE PREPARE stmt_drop_idx;

SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS c
    WHERE c.TABLE_SCHEMA = @schema_name
      AND c.TABLE_NAME = 'cart_items'
      AND c.COLUMN_NAME = 'product_id'
);

SET @drop_col_sql := IF(
    @col_exists > 0,
    'ALTER TABLE cart_items DROP COLUMN product_id',
    'SELECT 1'
);
PREPARE stmt_drop_col FROM @drop_col_sql;
EXECUTE stmt_drop_col;
DEALLOCATE PREPARE stmt_drop_col;
