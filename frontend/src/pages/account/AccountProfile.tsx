import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, Mail, Pencil, Phone, Shield, User } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { userService } from "@/services/user.service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/apiError"

export default function AccountProfile() {
  const user = useAuthStore((s) => s.user)
  const applyUserProfile = useAuthStore((s) => s.applyUserProfile)

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  if (!user) return null

  const initial =
    (user.fullName?.trim()?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()

  const startEdit = () => {
    setFullName(user.fullName?.trim() ?? "")
    setPhone(user.phone?.trim() ?? "")
    setError(null)
    setOkMsg(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setOkMsg(null)
    try {
      const { data } = await userService.updateMe({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      })
      if (!data.success || !data.result) throw new Error(data.message || "Cập nhật thất bại")
      applyUserProfile(data.result)
      setOkMsg("Đã lưu thông tin.")
      setEditing(false)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-xl py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Về trang chủ
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#253d4e]">Hồ sơ tài khoản</h1>
          <p className="mt-2 text-sm text-gray-600">
            Cập nhật họ tên và số điện thoại qua API. Email do hệ thống quản lý.
          </p>
        </div>
        {!editing ? (
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={startEdit}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
              Hủy
            </Button>
            <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {okMsg}
        </p>
      ) : null}

      <Card className="mt-8 overflow-hidden border-gray-200/80 p-0 shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-br from-primary/10 to-[#def7ec]/50 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-2xl font-bold text-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-[#253d4e]">{user.fullName?.trim() || "—"}</p>
              <p className="mt-0.5 truncate text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-gray-100 px-6 py-2 text-sm">
          <div className="flex items-start gap-3 py-4">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <dt className="font-semibold text-gray-500">Họ và tên</dt>
              {editing ? (
                <Input
                  className="mt-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              ) : (
                <dd className="mt-0.5 text-[#253d4e]">{user.fullName?.trim() || "—"}</dd>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <div>
              <dt className="font-semibold text-gray-500">Email</dt>
              <dd className="mt-0.5 break-all text-[#253d4e]">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <dt className="font-semibold text-gray-500">Số điện thoại</dt>
              {editing ? (
                <Input
                  className="mt-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              ) : (
                <dd className="mt-0.5 text-[#253d4e]">{user.phone?.trim() || "—"}</dd>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <div>
              <dt className="mb-2 font-semibold text-gray-500">Vai trò</dt>
              <dd className="flex flex-wrap gap-2">
                {user.roles?.length ? (
                  user.roles.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </dd>
            </div>
          </div>
        </dl>
      </Card>
    </div>
  )
}
