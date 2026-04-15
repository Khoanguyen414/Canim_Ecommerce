import { Link } from "react-router-dom"
import type { CategoryNode } from "@/types/api.types"

const EMOJI = ["📱", "👕", "🏠", "⚽", "📚", "💄", "🛍️", "🎧", "👟", "⌚", "🧴"]

function formatItemCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

interface CategoryCardProps {
  category: CategoryNode
  index: number
  /** Total ACTIVE products in this category from public API; undefined while loading */
  itemCount?: number
}

export function CategoryCard({ category, index, itemCount }: CategoryCardProps) {
  const icon = EMOJI[index % EMOJI.length]

  return (
    <Link
      to={`/products?categoryId=${category.id}`}
      className="group flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#E0F7F1] transition-transform group-hover:scale-105 md:h-[4.5rem] md:w-[4.5rem]">
        <span className="text-3xl md:text-4xl" aria-hidden>
          {icon}
        </span>
      </div>
      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900 md:text-base">{category.name}</h3>
      <p className="mt-1 text-xs font-normal text-gray-500 md:text-sm">
        {itemCount === undefined ? "…" : `${formatItemCount(itemCount)} items`}
      </p>
    </Link>
  )
}
