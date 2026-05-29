# Thanh toán VNPay / MoMo (production — tiền thật)

## 1. Sửa lỗi Redis

Redis chỉ dùng **cache giỏ hàng**; MySQL vẫn là nguồn chính. Nếu không chạy Redis, API giỏ vẫn hoạt động (chậm hơn một chút).

**Khuyến nghị — chạy Redis bằng Docker:**

```bash
cd backend/canim_ecommerce
docker compose up -d redis
```

Kiểm tra: `docker ps` thấy `canim_ecommerce_redis` đang `Up`.

## 2. Bật thanh toán thật

1. Đăng ký merchant:
   - **VNPay:** https://vnpay.vn — nhận `TMN Code` + `Hash Secret`
   - **MoMo Business:** https://business.momo.vn — nhận `Partner Code`, `Access Key`, `Secret Key`

2. Sao chép `.env.example` → `.env` (không commit `.env`):

```env
PAYMENT_ENV=production
spring.profiles.active=production

VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...

MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
```

3. **URL công khai HTTPS** (bắt buộc production):
   - VNPay **IPN:** `https://<api-domain>/canim_ecommerce/payments/vnpay/ipn`
   - MoMo **notify:** `https://<api-domain>/canim_ecommerce/payments/momo/notify`
   - Return (frontend): `https://<shop-domain>/payment/vnpay-return` và `/payment/momo-return`

   Trên máy dev có thể dùng [ngrok](https://ngrok.com) trỏ vào port `8000` (API) và `5173` (frontend), rồi khai báo URL ngrok trong cổng merchant VNPay/MoMo.

4. Khởi động backend với biến môi trường (IDE hoặc shell).

## 3. Kiểm tra

- Đặt đơn nhỏ (ví dụ 10.000đ) → VNPay/MoMo → thanh toán thật → quay về `/payment/*-return` → đơn `PAID`.
- Log backend: `VNPAY create payment [production]` / `MOMO create payment [production]`.

## 4. Không gửi secret trong chat công khai

Chỉ đặt `VNPAY_*` / `MOMO_*` trong `.env` local hoặc secret manager server. Nếu cần hỗ trợ cấu hình, gửi **đã che** (ví dụ `TMN: 2QXU***`).
