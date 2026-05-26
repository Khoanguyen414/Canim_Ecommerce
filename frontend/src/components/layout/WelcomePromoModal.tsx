import { Gift, X } from "lucide-react"

type WelcomePromoModalProps = {
  open: boolean
  onClose: () => void
}

export default function WelcomePromoModal({ open, onClose }: WelcomePromoModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-promo-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#ffdacc] bg-[#fffdfb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Đóng quảng cáo"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-r from-[#ffd8c8] via-[#ffdccc] to-[#ffe4d7] px-9 pb-9 pt-10 text-[#7c3d2e]">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/55">
            <Gift className="h-6 w-6" />
          </div>
          <h2 id="welcome-promo-title" className="text-3xl font-extrabold leading-tight md:text-4xl">
            Chào mừng bạn đến với Canim
          </h2>
          <p className="mt-3 max-w-xl text-base text-[#8f4b3a]/90 md:text-lg">
            Nhận ưu đãi mở cửa tới 15% cho đơn hàng đầu tiên trong hôm nay.
          </p>
        </div>

        <div className="space-y-4 px-9 py-8">
          <div className="rounded-2xl border border-[#ffd8c9] bg-[#fff3ed] px-5 py-4 text-base text-[#8a3e2c]">
            Mã giảm giá: <span className="font-extrabold tracking-wide">WELCOME15</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-primary px-5 py-3.5 text-base font-bold text-white transition hover:bg-primary/90"
          >
            Bắt đầu mua sắm
          </button>
        </div>
      </div>
    </div>
  )
}
