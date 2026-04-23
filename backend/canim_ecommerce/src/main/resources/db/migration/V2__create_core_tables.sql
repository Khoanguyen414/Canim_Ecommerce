-- V2__create_core_tables.sql
-- 1. roles
CREATE TABLE
    IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. users
CREATE TABLE
    IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(200),
        phone VARCHAR(50),
        is_active TINYINT (1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3. user_roles
CREATE TABLE
    IF NOT EXISTS user_roles (
        user_id BIGINT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4. categories
CREATE TABLE
    IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT DEFAULT NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5. products
CREATE TABLE
    IF NOT EXISTS products (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_desc VARCHAR(512),
        long_desc TEXT,
        brand VARCHAR(100),
        category_id INT,
        status ENUM ('ACTIVE', 'INACTIVE', 'HIDDEN') DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 6. product_variants
CREATE TABLE
    IF NOT EXISTS product_variants (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(50),
        size VARCHAR(50),
        price DECIMAL(15, 2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 7. product_images
CREATE TABLE
    IF NOT EXISTS product_images (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        url VARCHAR(1024),
        position INT DEFAULT 0,
        is_main TINYINT (1) DEFAULT 0,
        CONSTRAINT fk_img_prod FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 8. inventory
CREATE TABLE
    IF NOT EXISTS inventory (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        variant_id BIGINT NOT NULL,
        quantity INT DEFAULT 0,
        reserved INT DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_inventory_variant (variant_id),
        CONSTRAINT fk_inv_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 9. carts + cart_items
CREATE TABLE
    IF NOT EXISTS carts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS cart_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        cart_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        quantity INT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
        CONSTRAINT fk_ci_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 10. orders + order_items
CREATE TABLE
    IF NOT EXISTS orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(64) NOT NULL UNIQUE,
        user_id BIGINT,
        sub_total DECIMAL(15, 2) NOT NULL,
        shipping_fee DECIMAL(15, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        total_amount DECIMAL(15, 2) NOT NULL,
        receiver_name VARCHAR(100) NOT NULL,
        receiver_phone VARCHAR(20) NOT NULL,
        shipping_address TEXT NOT NULL,
        order_note TEXT,
        payment_method ENUM ('COD', 'VNPAY', 'MOMO') DEFAULT 'COD',
        payment_status ENUM ('UNPAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
        order_status ENUM (
            'PENDING',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
        ) DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        variant_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT fk_oi_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Indexes for performance (basic)
CREATE INDEX idx_products_category ON products (category_id);

CREATE INDEX idx_inventory_variant ON inventory (variant_id);

CREATE INDEX idx_orders_created_at ON orders (created_at);

CREATE INDEX idx_orders_user_id ON orders (user_id);

-- 10. user_events (lightweight for AI later)
CREATE TABLE
    IF NOT EXISTS user_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT,
        product_id BIGINT,
        event_type ENUM (
            'VIEW',
            'CLICK',
            'ADD_TO_CART',
            'PURCHASE',
            'SEARCH'
        ) NOT NULL,
        event_meta JSON,
        occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_user_product (user_id, product_id, event_type),
        CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_event_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;