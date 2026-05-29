/**
 * Cấu hình chuyển khoản QR (VietQR / ngân hàng).
 *
 * 1. Lấy STK và mã NAPAS (BIN) từ app ngân hàng hoặc https://vietqr.net
 * 2. Điền accountNumber, accountName, bankName, vietqrAcquirerId
 * 3. Đồng bộ với backend: payment.personal-qr.vnpay.* trong application.properties
 */
export const paymentQrConfig = {
  vietqr: {
    template: "compact2" as const,
  },
  vnpay: {
    accountName: "canim shop",
    bankName: "Vietcombank",
    accountNumber: "1031344027",
    vietqrAcquirerId: "970436",
    fallbackQrImageUrl: "/qr/vnpay-qr.png",
  },
  transferNoteTemplate: "Ma don: {orderNo}",
} as const
