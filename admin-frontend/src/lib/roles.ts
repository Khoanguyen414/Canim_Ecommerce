export function hasAdminRole(roles: string[] | undefined | null): boolean {
  if (!roles || roles.length === 0) return false
  const normalized = roles.map((r) => r.toUpperCase().replace(/^ROLE_/, ""))
  return normalized.includes("ADMIN")
}
