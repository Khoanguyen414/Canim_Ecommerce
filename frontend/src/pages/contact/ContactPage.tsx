import { type FormEvent, useState } from "react"
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaStore } from "react-icons/fa"

type ContactForm = {
  fullName: string
  email: string
  phoneNumber: string
  message: string
}

type ContactErrors = Partial<Record<keyof ContactForm, string>>

const initialForm: ContactForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  message: "",
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [errors, setErrors] = useState<ContactErrors>({})

  const onChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors: ContactErrors = {}

    if (!form.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ và tên."
    if (!form.email.trim()) nextErrors.email = "Vui lòng nhập email."
    else if (!emailRegex.test(form.email.trim())) nextErrors.email = "Email không đúng định dạng."
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Vui lòng nhập số điện thoại."
    if (!form.message.trim()) nextErrors.message = "Vui lòng nhập nội dung tin nhắn."

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    window.alert("Gửi liên hệ thành công!")
    setForm(initialForm)
    setErrors({})
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 text-center md:mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#253d4e] md:text-4xl">Liên hệ với Canim</h1>
        <p className="mt-2 text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </header>

      <section className="row g-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-md-6">
          <div className="h-full rounded-2xl bg-white p-6 shadow-lg md:p-8">
            <h2 className="mb-5 text-xl font-bold text-[#253d4e]">Thông tin liên hệ</h2>

            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <FaStore className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold">Canim_ecommerce</p>
                  <p className="text-sm text-gray-600">Web bán quần áo và phụ kiện thời trang</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 h-4 w-4 text-primary" />
                <p>14 Doãn Uẩn, Khuê Mỹ, Ngũ Hành Sơn</p>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope className="mt-1 h-4 w-4 text-primary" />
                <p>mphan5768@gmail.com</p>
              </li>
              <li className="flex items-start gap-3">
                <FaPhoneAlt className="mt-1 h-4 w-4 text-primary" />
                <p>0705396414</p>
              </li>
              <li className="flex items-start gap-3">
                <FaClock className="mt-1 h-4 w-4 text-primary" />
                <p>8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
            <h2 className="mb-5 text-xl font-bold text-[#253d4e]">Gửi tin nhắn cho chúng tôi</h2>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="contact-full-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  id="contact-full-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => onChange("fullName", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  id="contact-phone"
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => onChange("phoneNumber", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.phoneNumber ? <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p> : null}
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
                  Nội dung
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => onChange("message", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
              </div>

              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
              >
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl shadow-lg">
        <iframe
          title="Ngũ Hành Sơn, Đà Nẵng"
          src="https://www.google.com/maps?q=Ng%C5%A9+H%C3%A0nh+S%C6%A1n,+%C4%90%C3%A0+N%E1%BA%B5ng&output=embed"
          width="100%"
          height="380"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  )
}
