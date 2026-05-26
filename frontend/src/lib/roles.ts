/** Role nghiệp vụ (không gồm tiền tố Spring `ROLE_`) */
export type AppRole = "USER" | "ADMIN" | "WAREHOUSE"

export function normalizeRole(role: string): AppRole | null {
  const r = role.trim().toUpperCase()
  if (r === "ROLE_USER" || r === "USER") return "USER"
  if (r === "ROLE_ADMIN" || r === "ADMIN") return "ADMIN"
  if (r === "ROLE_WAREHOUSE" || r === "WAREHOUSE") return "WAREHOUSE"
  return null
}

export function toAppRoles(roles: string[] | undefined): AppRole[] {
  if (!roles?.length) return []
  const out: AppRole[] = []
  for (const role of roles) {
    const n = normalizeRole(role)
    if (n && !out.includes(n)) out.push(n)
  }
  return out
}

export function hasAppRole(roles: string[] | undefined, allowed: AppRole | AppRole[]): boolean {
  const set = new Set(toAppRoles(roles))
  const list = Array.isArray(allowed) ? allowed : [allowed]
  return list.some((r) => set.has(r))
}
