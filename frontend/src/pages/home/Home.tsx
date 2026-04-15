import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { CategoryCard } from "@/components/home/CategoryCard"
import { HomeShowcaseCard } from "@/components/home/HomeShowcaseCard"
import { HOME_SHOWCASE_MOCK, mockDiscountPercent } from "@/data/homeShowcaseMock"
import { buildShowcasePropsFromProduct } from "@/lib/homeShowcase"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ErrorState } from "@/components/common/ErrorState"
import { usePublicProducts } from "@/hooks/usePublicProducts"
import { useCartStore } from "@/store/cart.store"
import type { CategoryNode, ProductDetail } from "@/types/api.types"
import { getDefaultVariant, getProductMainImage } from "@/lib/product"
import { toNumber } from "@/lib/format"
import { categoryService } from "@/services/category.service"
import { productService } from "@/services/product.service"
import { getApiErrorMessage } from "@/lib/apiError"
export default function Home() {
  const { products, loading, error, reload } = usePublicProducts(8)
  const addLine = useCartStore((s) => s.addLine)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [newsletterEmail, setNewsletterEmail] = useState("")

  const [categoryItemCounts, setCategoryItemCounts] = useState<Record<number, number>>({})

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    setCategoriesError(null)
    try {
      const { data } = await categoryService.getRoots()
      if (!data.success || !data.result) throw new Error(data.message || "Failed to load categories")
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

  const categoryPreview = useMemo(() => categories.slice(0, 6), [categories])

  useEffect(() => {
    if (!categoryPreview.length) {
      setCategoryItemCounts({})
      return
    }
    let cancelled = false
    void (async () => {
      const entries = await Promise.all(
        categoryPreview.map(async (c) => {
          try {
            const { data } = await productService.getPublicPage({
              categoryId: c.id,
              pageNum: 1,
              sizePage: 1,
            })
            const total =
              data.success && data.result ? data.result.totalElements : 0
            return [c.id, total] as const
          } catch {
            return [c.id, 0] as const
          }
        }),
      )
      if (!cancelled) {
        setCategoryItemCounts(Object.fromEntries(entries))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoryPreview])

  const handleQuickAdd = (p: ProductDetail) => {
    const v = getDefaultVariant(p)
    if (!v) return
    addLine({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      sku: v.sku,
      color: v.color,
      size: v.size,
      price: toNumber(v.price),
      quantity: 1,
      imageUrl: getProductMainImage(p),
    })
    navigate("/cart")
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterEmail("")
  }

  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {/* Categories — GET /categories/roots + product counts */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">Shop by Category</h2>
                <p className="text-gray-600">Explore our curated collections</p>
              </div>
              <Link
                to="/categories"
                className="hidden items-center gap-2 font-semibold text-orange-600 transition-all hover:gap-3 hover:text-orange-700 md:flex"
              >
                View All <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner label="Loading categories..." />
            </div>
          ) : null}

          {!categoriesLoading && categoriesError ? (
            <ErrorState message={categoriesError} onRetry={() => void loadCategories()} />
          ) : null}

          {!categoriesLoading && !categoriesError && categoryPreview.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No root categories yet. Add categories in the admin panel to show them here.
            </p>
          ) : null}

          {!categoriesLoading && !categoriesError && categoryPreview.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6">
              {categoryPreview.map((c, i) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  index={i}
                  itemCount={categoryItemCounts[c.id]}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8 text-center md:hidden">
            <Link to="/categories" className="inline-flex items-center gap-2 font-semibold text-orange-600">
              View all categories <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products — GET /products/public */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">Trending now</h2>
                <p className="text-gray-600">
                  Live ACTIVE products from your API replace the samples below as soon as they exist in the catalog.
                </p>
              </div>
              <Link
                to="/products"
                className="hidden items-center gap-2 font-semibold text-orange-600 transition-all hover:gap-3 hover:text-orange-700 md:flex"
              >
                View all <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {loading ? <LoadingSpinner label="Loading products..." /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}

          {!loading && !error && products.length === 0 ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Sample showcase:</strong> these cards use placeholder data and images. Create ACTIVE products in
              the admin backend — they will appear here automatically on the next load.
            </div>
          ) : null}

          {!loading && !error && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <HomeShowcaseCard
                  key={p.id}
                  {...buildShowcasePropsFromProduct(p, handleQuickAdd)}
                />
              ))}
            </div>
          ) : null}

          {!loading && !error && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {HOME_SHOWCASE_MOCK.map((m) => (
                <HomeShowcaseCard
                  key={m.id}
                  name={m.name}
                  imageUrl={m.image}
                  href="/products"
                  priceVnd={m.priceVnd}
                  originalVnd={m.originalVnd}
                  discountPercent={mockDiscountPercent(m.priceVnd, m.originalVnd)}
                  rating={m.rating}
                  reviewCount={m.reviewCount}
                  inStock
                  verified
                  soldLabel={m.soldLabel}
                  isSample
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 font-semibold text-orange-600">
              View all products <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flash sale CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-orange-900 to-red-900">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-orange-400 mix-blend-multiply blur-3xl filter" />
              <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-red-400 mix-blend-multiply blur-3xl filter" />
            </div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-16">
              <div className="space-y-4 text-white">
                <div className="inline-block rounded-full border border-orange-400/50 bg-orange-500/30 px-4 py-1 text-sm font-semibold text-orange-200">
                  ⏰ Limited time
                </div>
                <h3 className="text-balance text-4xl font-bold leading-tight md:text-5xl">Flash sale today</h3>
                <p className="text-lg leading-relaxed text-orange-50/80">
                  Browse everything on sale — variant pricing — quick add to cart from the home page.
                </p>
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                  <Link
                    to="/products"
                    className="inline-flex justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/50"
                  >
                    Shop now
                  </Link>
                  <span className="text-sm font-semibold text-orange-200">Stock synced with inventory</span>
                </div>
              </div>
              <div className="text-center text-7xl opacity-80">⚡</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Why shop with us</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Products, inventory, and orders stay in sync with your backend
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 text-3xl">
                🚚
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Fast shipping</h3>
              <p className="leading-relaxed text-gray-600">
                Clear packing and delivery workflow — track orders after checkout.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 text-3xl">
                🔒
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Secure payments</h3>
              <p className="leading-relaxed text-gray-600">
                JWT authentication and encrypted API traffic — built for real commerce.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 text-3xl">
                ↩️
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Easy returns</h3>
              <p className="leading-relaxed text-gray-600">
                Customer-first policies — reach out through our support channels anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter — UI only */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-900 py-16 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-teal-500 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">Stay in the loop</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-teal-50/80">
            Leave your email — newsletter signup can be wired to your backend later.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-xl px-4 py-4 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
            >
              Subscribe
            </button>
          </form>

          <p className="mt-4 text-sm text-teal-200/60">We respect your privacy. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  )
}
