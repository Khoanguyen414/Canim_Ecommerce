import { useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { getApiErrorMessage } from "@/lib/apiError"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/"
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-teal-50">Sign in to your shop account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg border-orange-200 focus:border-teal-500 focus:outline-none transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-lg border-orange-200 focus:border-teal-500 focus:outline-none transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-4 text-sm text-gray-500">Or continue with</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            <p className="mt-8 text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">© {new Date().getFullYear()} canim ecommerce. All rights reserved.</p>
      </div>
    </div>
  )
}
