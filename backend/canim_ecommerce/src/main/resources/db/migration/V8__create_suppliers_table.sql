CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(200),
    email VARCHAR(255) UNIQUE, -- Email nên là duy nhất để tránh trùng lặp đối tác
    phone VARCHAR(20),
    address TEXT,
    is_active TINYINT(1) DEFAULT 1, -- 1: Đang hợp tác, 0: Ngừng hợp tác (Soft Delete)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;