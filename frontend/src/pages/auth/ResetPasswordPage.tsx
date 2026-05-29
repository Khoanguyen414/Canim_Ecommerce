import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Lock, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import { getApiErrorMessage } from "@/lib/apiError"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get("token") ?? ""

  const [token, setToken] = useState(tokenFromUrl)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }
    if (!token.trim()) {
      setError("Thiếu mã token. Mở link từ email hoặc dán token vào ô bên dưới.")
      return
    }

    setLoading(true)
    try {
      const res = await authService.resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      })
      if (!res.data.success) throw new Error(res.data.message)
      navigate("/?auth=login", { replace: true, state: { resetOk: true } })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Mã token
            <Input
              className="mt-1 font-mono text-xs"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dán token từ email"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu mới
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                className="pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
          </label>
          <label className="block text-sm font-medium">
            Xác nhận mật khẩu
            <Input
              type="password"
              className="mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/?auth=login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  )
}
