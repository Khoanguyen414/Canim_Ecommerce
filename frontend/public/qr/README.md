# Thư mục QR tĩnh (không dùng khi thanh toán trên web)

Trang `/orders/:id/qr-pay` **chỉ hiển thị QR động** (sinh bằng `vietnam-qr-pay` + `QRCodeSVG` theo số tiền và mã đơn).

File PNG ở đây **không** được load trên luồng checkout — chỉ để bạn lưu ảnh QR cá nhân tham khảo.

| File | Ghi chú |
|------|---------|
| `momo-qr.png` | QR tĩnh MoMo (dự phòng) |
| `vnpay-qr.png` | QR tĩnh ngân hàng (dự phòng) |

Hướng dẫn: [docs/HUONG_DAN_THANH_TOAN_QR_CA_NHAN.md](../../../docs/HUONG_DAN_THANH_TOAN_QR_CA_NHAN.md)
