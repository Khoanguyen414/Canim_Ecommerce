import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EarthCategoryAtlas } from "@/components/home/EarthCategoryAtlas"
import ProductCard from "@/components/product/ProductCard"
import RecommendedProductsSection from "@/components/recommendation/RecommendedProductsSection"
import { HomeNestHero } from "@/components/shop/HomeNestHero"
import type { ProductFacetParams } from "@/config/productFacets"
import { usePublicProducts } from "@/hooks/usePublicProducts"
import { getApiErrorMessage } from "@/lib/apiError"
import { toNumber } from "@/lib/format"
import { getDefaultVariant, getProductMainImage } from "@/lib/product"
import { categoryService } from "@/services/category.service"
import { useCartStore } from "@/store/cart.store"
import type { CategoryNode, ProductDetail } from "@/types/api.types"

export default function Home() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")

  const addToCart = useCartStore((state) => state.addToCart)
  const navigate = useNavigate()

  const homeFacets = useMemo(
    (): ProductFacetParams => ({
      categoryId,
    }),
    [categoryId],
  )

  const {
    products,
    loading,
    error,
    reload,
  } = usePublicProducts(homeFacets, 1, 12)

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    setCategoriesError(null)

    try {
      const { data } = await categoryService.getRoots()

      if (!data.success || !data.result) {
        throw new Error(data.message || "Failed to load categories")
      }

      setCategories(data.result)
    } catch (e) {
      setCategoriesError(getApiErrorMessage(e))
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const categoryPreview = useMemo(() => {
    return categories.slice(0, 6)
  }, [categories])

  const tabCategories = useMemo(() => {
    return categoryPreview.slice(0, 5)
  }, [categoryPreview])

  const handleQuickAdd = async (product: ProductDetail) => {
    const variant = getDefaultVariant(product)

    if (!variant) return

    await addToCart({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: toNumber(variant.price),
      quantity: 1,
      imageUrl: getProductMainImage(product),
    })

    navigate("/cart")
  }

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!newsletterEmail.trim()) return

    setNewsletterEmail("")
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      <HomeNestHero />

      {/*
        Đã ẩn section "Dành cho bạn".
        Lý do:
        - Personalized recommendation chưa có dữ liệu hành vi người dùng thật.
        - Trước đó dễ bị trùng với "Sản phẩm đang hot".
        - Nếu fallback mock/fake product sẽ gây lỗi Product not found.
        Khi AI personalized recommendation có dữ liệu thật từ lịch sử xem/tìm kiếm/giỏ hàng,
        có thể bật lại một section riêng sau.
      */}

      <section className="container mx-auto px-4 pb-10 pt-2">
        <h2 className="mb-6 text-center text-base font-medium uppercase tracking-[0.28em] text-neutral-900 md:text-lg">
          Hàng mới về
        </h2>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-5 border-b border-neutral-200 text-xs font-medium uppercase tracking-wide text-neutral-700 sm:gap-6 sm:text-[13px]">
          <button
            type="button"
            onClick={() => setCategoryId(undefined)}
            className={`border-b-2 pb-2 transition ${
              categoryId == null
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Tất cả
          </button>

          {tabCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`max-w-[140px] truncate border-b-2 pb-2 transition ${
                categoryId === category.id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
              title={category.name}
            >
              {category.name}
            </button>
          ))}

          <Link
            to="/products"
            className="border-b-2 border-transparent pb-2 text-neutral-500 transition hover:text-neutral-800"
          >
            Xem thêm
          </Link>
        </div>

        {loading ? <LoadingSpinner label="Đang tải sản phẩm…" /> : null}

        {!loading && error ? (
          <ErrorState message={error} onRetry={() => void reload()} />
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
            <strong>Chưa có sản phẩm phù hợp.</strong>
            <span className="ml-1">
              Bạn thử chọn danh mục khác hoặc quay lại sau nhé.
            </span>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleQuickAdd}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="container mx-auto px-4 pb-12">
        <RecommendedProductsSection
          type="TRENDING"
          title="Sản phẩm đang hot"
          subtitle="Những sản phẩm đang được nhiều khách quan tâm, thêm giỏ hoặc mua gần đây."
        />
      </section>

      <EarthCategoryAtlas
        categories={categories}
        loading={categoriesLoading}
        error={categoriesError}
        onRetry={() => void loadCategories()}
      />

      <div className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#f47f68] to-[#f2a98a] p-8 shadow-xl shadow-primary/20 md:p-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-[#cf5b45]/35 blur-2xl"
              aria-hidden
            />

            <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
              <div className="space-y-5 text-white">
                <span className="inline-flex rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/95">
                  Ưu đãi trong ngày
                </span>

                <h3 className="text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                  Tiết kiệm hơn với combo &amp; lựa chọn tuần này
                </h3>

                <p className="max-w-lg text-lg leading-relaxed text-white/90">
                  Giá và khuyến mãi cập nhật liên tục — gom đơn theo tuần để nhận ưu đãi tốt hơn.
                </p>

                <Link
                  to="/products"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-primary shadow-lg shadow-black/15 transition hover:bg-gray-50 hover:shadow-xl"
                >
                  Mua ngay <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative flex min-h-[200px] items-center justify-center md:justify-end">
                <div className="flex h-44 w-44 items-center justify-center rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md md:h-52 md:w-52">
                  <span className="text-6xl drop-shadow-lg md:text-7xl" aria-hidden>
                    🛒
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[#253d4e] md:text-4xl">
              Vì sao chọn Canim
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Giao nhanh, giá minh bạch và hỗ trợ rõ ràng trong suốt hành trình mua sắm của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "Giao hàng nhanh",
                description:
                  "Theo dõi đơn sau khi thanh toán — cập nhật trạng thái minh bạch.",
                Icon: Truck,
              },
              {
                title: "Thanh toán an toàn",
                description:
                  "Thông tin được mã hóa và xử lý theo quy trình bảo mật hiện đại.",
                Icon: ShieldCheck,
              },
              {
                title: "Đổi trả dễ dàng",
                description:
                  "Ưu tiên trải nghiệm khách hàng — liên hệ bất cứ lúc nào bạn cần.",
                Icon: RotateCcw,
              },
            ].map(({ title, description, Icon }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/80 p-8 text-center shadow-md shadow-gray-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-inner ring-1 ring-primary/10 transition group-hover:scale-105 group-hover:bg-primary/18">
                  <Icon className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </div>

                <h3 className="mb-3 text-xl font-bold text-[#253d4e]">
                  {title}
                </h3>

                <p className="text-[15px] leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-[#f47f68] to-[#f2a98a] py-14 text-white md:py-16">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Nhận ưu đãi mới nhất từ Canim
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Đăng ký để nhận thông tin khuyến mãi, sản phẩm mới và gợi ý phối đồ phù hợp.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="home-newsletter-email" className="sr-only">
              Email
            </label>

            <input
              id="home-newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="Nhập email của bạn"
              className="min-h-[52px] flex-1 rounded-xl border border-white/25 bg-white/95 px-4 py-3 text-gray-900 shadow-inner outline-none placeholder:text-gray-500 focus:border-white focus:ring-2 focus:ring-white/80"
            />

            <button
              type="submit"
              className="min-h-[52px] whitespace-nowrap rounded-xl bg-[#253d4e] px-8 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#1a2d38] hover:shadow-xl"
            >
              Đăng ký
            </button>
          </form>

          <p className="mt-5 text-sm text-white/75">
            Chúng tôi tôn trọng quyền riêng tư. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </div>
  )
}