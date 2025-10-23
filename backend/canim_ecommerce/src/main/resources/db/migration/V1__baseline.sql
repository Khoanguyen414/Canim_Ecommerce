-- V1__baseline.sql
-- Set baseline (optional) - ensure clean baseline for Flyway
-- This file ensures DB charset and engine defaults
set @@session.character_set_client = 'utf8mb4';
set @@session.character_set_connection = 'utf8mb4';
set @@session.collation_connection = 'utf8mb4_unicode_ci';
