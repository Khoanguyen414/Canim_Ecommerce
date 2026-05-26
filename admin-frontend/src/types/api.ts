export type ApiResponse<T> = {
  success: boolean
  message?: string
  result?: T
}

export type AuthResult = {
  accessToken: string
  refreshToken?: string
}

export type UserProfile = {
  id: number
  email: string
  fullName: string
  phone?: string | null
  roles: string[]
}

export type PagedResult<T> = {
  content?: T[]
  data?: T[]
  totalElements: number
  totalPages: number
  page?: number
  size?: number
}

export type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  parentId?: number | null
  parentName?: string | null
  children?: Category[]
  createdAt?: string
}

export type Supplier = {
  id: number
  supplierCode?: string
  name: string
  contactName?: string | null
  email: string
  phone: string
  address?: string | null
  isActive?: boolean
  createdAt?: string
}

export type Warehouse = {
  id: number
  name: string
  address?: string | null
  isActive?: boolean
  createdAt?: string
}

export type UserRecord = {
  id: number
  email: string
  fullName: string
  phone?: string | null
  active: boolean
  roles: string[]
  createdAt?: string
}

export type RoleRecord = {
  id: number
  name: string
}
