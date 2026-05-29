import { useCallback, useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { reviewService } from "@/services/review.service"
import { useAuthStore } from "@/store/auth.store"
import { getApiErrorMessage } from "@/lib/apiError"
import { toNumber } from "@/lib/format"
import type { ProductReviewDto, ReviewSummaryDto } from "@/types/api.types"
import { cn } from "@/lib/cn"

type Props = {
  productId: number
  orderItemId?: number | null
}

function Stars({ value, onChange, readonly }: { value: number; onChange?: (n: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={cn("text-amber-400", readonly && "cursor-default")}
          aria-label={`${n} sao`}
        >
          <Star className={cn("h-5 w-5", n <= value ? "fill-current" : "fill-none")} />
        </button>
      ))}
    </div>
  )
}

export function ProductReviewsSection({ productId, orderItemId }: Props) {
  const user = useAuthStore((s) => s.user)
  const [summary, setSummary] = useState<ReviewSummaryDto | null>(null)
  const [reviews, setReviews] = useState<ProductReviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(Boolean(orderItemId))
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sumRes, listRes] = await Promise.all([
        reviewService.getSummary(productId),
        reviewService.list(productId, 1, 20),
      ])
      if (sumRes.success && sumRes.result) setSummary(sumRes.result)
      if (listRes.success && listRes.result) setReviews(listRes.result.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async () => {
    if (!user) return
    if (!orderItemId) {
      setFormMsg("Vui lòng đánh giá từ đơn hàng đã giao (nút Đánh giá ở chi tiết đơn).")
      return
    }
    setSubmitting(true)
    setFormMsg(null)
    try {
      const res = await reviewService.create(productId, {
        orderItemId,
        rating,
        comment: comment.trim() || undefined,
      })
      if (!res.success) throw new Error(res.message)
      setFormMsg("Đánh giá thành công.")
      setComment("")
      setShowForm(false)
      await load()
    } catch (err) {
      const msg = getApiErrorMessage(err)
      if (msg.toLowerCase().includes("delivered") || msg.includes("giao")) {
        setFormMsg("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao thành công.")
      } else if (msg.toLowerCase().includes("already") || msg.includes("đã đánh giá")) {
        setFormMsg("Bạn đã đánh giá sản phẩm này rồi.")
      } else {
        setFormMsg(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const avg = summary ? toNumber(summary.averageRating) : 0

  return (
    <div className="space-y-6">
      {loading ? <p className="text-sm text-gray-500">Đang tải đánh giá...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {summary ? (
        <div className="flex flex-wrap items-center gap-6 rounded-lg bg-[#f4f6f8] p-4">
          <div>
            <p className="text-3xl font-bold text-[#253d4e]">{avg.toFixed(1)}</p>
            <Stars value={Math.round(avg)} readonly />
            <p className="mt-1 text-sm text-gray-500">{summary.reviewCount} đánh giá</p>
          </div>
          <div className="flex-1 space-y-1 text-sm">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary[`rating${star}Count` as keyof ReviewSummaryDto] as number
              const pct = summary.reviewCount ? (count / summary.reviewCount) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-8">{star} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-gray-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {user ? (
        <div>
          {!showForm ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Viết đánh giá
            </Button>
          ) : (
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="font-medium text-[#253d4e]">Đánh giá của bạn</p>
              {orderItemId ? (
                <p className="text-xs text-gray-500">Mã dòng đơn: {orderItemId}</p>
              ) : (
                <p className="text-xs text-amber-700">
                  Mở từ đơn đã giao để hệ thống ghi nhận sản phẩm bạn đã mua.
                </p>
              )}
              <Stars value={rating} onChange={setRating} />
              <Textarea
                placeholder="Chia sẻ trải nghiệm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              {formMsg ? <p className="text-sm text-gray-600">{formMsg}</p> : null}
              <div className="flex gap-2">
                <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Đăng nhập để viết đánh giá.</p>
      )}

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-[#253d4e]">{r.userName ?? `User #${r.userId}`}</p>
              <Stars value={r.rating} readonly />
            </div>
            {r.comment ? <p className="mt-2 text-sm text-gray-600">{r.comment}</p> : null}
            {r.createdAt ? (
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString("vi-VN")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {!loading && reviews.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
      ) : null}
    </div>
  )
}
