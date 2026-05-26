import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FILTER_COLORS,
  FILTER_SIZES,
  describeActiveFacets,
  hasActiveFacets,
  type ProductFacetParams,
} from "@/config/productFacets"
import { cn } from "@/lib/cn"

type ProductFacetSidebarProps = {
  facets: ProductFacetParams
  onApply: (draft: ProductFacetParams) => void
  onClear: () => void
}

type SectionKey = "size" | "color" | "price"

function FacetSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-neutral-200 py-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-sm font-semibold uppercase tracking-wide text-neutral-900"
        onClick={onToggle}
      >
        {title}
        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      {open ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  )
}

export function ProductFacetSidebar({ facets, onApply, onClear }: ProductFacetSidebarProps) {
  const [draft, setDraft] = useState<ProductFacetParams>(facets)
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    size: true,
    color: true,
    price: true,
  })

  useEffect(() => {
    setDraft((d) => ({
      ...facets,
      sizes: facets.sizes ?? d.sizes,
      colors: facets.colors ?? d.colors,
      minPrice: facets.minPrice ?? d.minPrice,
      maxPrice: facets.maxPrice ?? d.maxPrice,
    }))
  }, [facets])

  const toggleSection = (key: SectionKey) => {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }))
  }

  const toggleSize = (size: string) => {
    setDraft((d) => {
      const current = d.sizes ?? []
      const next = current.includes(size) ? current.filter((x) => x !== size) : [...current, size]
      return { ...d, sizes: next.length ? next : undefined }
    })
  }

  const toggleColor = (color: string) => {
    setDraft((d) => {
      const current = d.colors ?? []
      const next = current.includes(color) ? current.filter((x) => x !== color) : [...current, color]
      return { ...d, colors: next.length ? next : undefined }
    })
  }

  const chips = describeActiveFacets(facets)
  const active = hasActiveFacets(facets)

  return (
    <aside className="sticky top-32 border border-neutral-200 bg-white px-4 py-2">
      <FacetSection title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
        <div className="flex flex-wrap gap-2">
          {FILTER_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "min-w-[2.5rem] rounded border px-2 py-1 text-xs font-medium",
                draft.sizes?.includes(size)
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-700 hover:border-neutral-900",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FacetSection>

      <FacetSection title="Màu sắc" open={openSections.color} onToggle={() => toggleSection("color")}>
        <div className="space-y-2">
          {FILTER_COLORS.map((color) => (
            <label key={color} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-400"
                checked={draft.colors?.includes(color) ?? false}
                onChange={() => toggleColor(color)}
              />
              {color}
            </label>
          ))}
        </div>
      </FacetSection>

      <FacetSection title="Mức giá" open={openSections.price} onToggle={() => toggleSection("price")}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={draft.minPrice ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Đến"
            value={draft.maxPrice ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </FacetSection>

      {chips.length > 0 ? (
        <div className="border-b border-neutral-200 py-3">
          <p className="mb-2 text-xs font-medium text-neutral-500">Đang lọc</p>
          <div className="flex flex-wrap gap-1">
            {chips.map((label) => (
              <span key={label} className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 py-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-none border-neutral-900 text-xs font-bold uppercase"
          onClick={() => {
            setDraft({})
            onClear()
          }}
        >
          Bỏ lọc
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-none bg-neutral-900 text-xs font-bold uppercase hover:bg-neutral-800"
          onClick={() => onApply({ ...facets, sizes: draft.sizes, colors: draft.colors, minPrice: draft.minPrice, maxPrice: draft.maxPrice })}
        >
          Lọc
        </Button>
      </div>

      {active ? (
        <p className="pb-3 text-center text-[11px] text-neutral-500">Bộ lọc facet đang áp dụng</p>
      ) : null}
    </aside>
  )
}
