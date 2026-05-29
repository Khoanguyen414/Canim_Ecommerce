import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import { getApiErrorMessage } from "@/lib/apiError"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authService.forgotPassword(email.trim())
      if (!res.data.success) throw new Error(res.data.message)
      setSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập email đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu nếu email tồn tại.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Email
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/?auth=login" className="text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  )
}
