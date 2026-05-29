# Sửa lỗi Flyway validate (checksum mismatch / V6–V7 chưa chạy)

Khi `mvn spring-boot:run` báo `FlywayValidateException`:

1. **Đảm bảo MySQL** chạy tại `localhost:3307`, DB `canim_ecommerce`.
2. Trong thư mục `backend/canim_ecommerce`:

```powershell
mvn flyway:repair
mvn flyway:migrate
mvn spring-boot:run
```

`repair` cập nhật checksum trong `flyway_schema_history` cho khớp file SQL hiện tại (V2–V5, V8).
`migrate` chạy bù V6, V7, V15… (đã bật `out-of-order`).

**Lưu ý:** `repair` chỉ dùng cho môi trường dev khi bạn **chắc** schema DB đã đúng với nội dung migration. Nếu vẫn lỗi, reset DB dev:

```sql
DROP DATABASE canim_ecommerce;
CREATE DATABASE canim_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Rồi `mvn spring-boot:run` (Flyway chạy từ V1).
