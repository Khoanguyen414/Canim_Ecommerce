-- Chạy file này MỘT LẦN nếu backend báo "failed migration to version 13"
-- mysql -h 127.0.0.1 -P 3307 -u root -p canim_ecommerce < scripts/repair-flyway-v13.sql

DELETE FROM flyway_schema_history
WHERE version = '13' AND success = 0;
