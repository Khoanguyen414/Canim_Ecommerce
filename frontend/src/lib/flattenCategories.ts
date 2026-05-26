import type { CategoryNode } from "@/types/api.types"

export type FlatCategoryOption = { id: number; label: string; depth: number }

export function flattenCategoryOptions(nodes: CategoryNode[], depth = 0): FlatCategoryOption[] {
  const out: FlatCategoryOption[] = []
  for (const n of nodes) {
    const prefix = depth > 0 ? `${"·".repeat(depth)} ` : ""
    out.push({ id: n.id, label: `${prefix}${n.name}`, depth })
    if (n.children?.length) out.push(...flattenCategoryOptions(n.children, depth + 1))
  }
  return out
}

/** Danh sách phẳng kèm parentId (ví dụ chọn danh mục lồng nhau) */
export type FlatCategoryRow = CategoryNode & { depth: number }

export function flattenCategoryRows(nodes: CategoryNode[], depth = 0): FlatCategoryRow[] {
  const out: FlatCategoryRow[] = []
  for (const n of nodes) {
    out.push({ ...n, depth })
    if (n.children?.length) out.push(...flattenCategoryRows(n.children, depth + 1))
  }
  return out
}
