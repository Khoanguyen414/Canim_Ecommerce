ALTER TABLE users
ADD COLUMN auth_provider ENUM('LOCAL', 'GOOGLE') NOT NULL DEFAULT 'LOCAL' AFTER phone,
ADD COLUMN google_subject_id VARCHAR(255) NULL AFTER auth_provider,
ADD COLUMN avatar_url VARCHAR(1024) NULL AFTER google_subject_id,
ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER avatar_url;

CREATE UNIQUE INDEX uk_users_google_subject_id ON users (google_subject_id);

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_password_reset_user ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_token_hash ON password_reset_tokens (token_hash);
