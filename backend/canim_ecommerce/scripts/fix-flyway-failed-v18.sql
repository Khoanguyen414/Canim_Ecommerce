-- Chạy khi Flyway báo "failed migration to version 18"
-- mysql -h 127.0.0.1 -P 3307 -u root -proot canim_ecommerce < scripts/fix-flyway-failed-v18.sql

DELETE FROM flyway_schema_history WHERE version = '18' AND success = 0;
