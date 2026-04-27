export interface ProductImage {
  original: string
  thumb: string
}

export interface Product {
  id: string
  name: string
  slug: string
  genericName: string
  manufacturer: string
  category: string
  subcategory: string | null
  form: string
  strength: string
  packSize: string
  description: string
  composition: string
  indications: string
  dosage: string
  sideEffects: string | null
  storage: string | null
  images: ProductImage[]
  isFeatured: boolean
  isActive: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  lastLogin: Date | null
}

export interface AuditLog {
  id: string
  adminId: string
  admin: { name: string; email: string }
  action: string
  target: string
  details: string | null
  ip: string | null
  userAgent: string | null
  createdAt: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  details?: unknown
}

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  featuredProducts: number
  totalCategories: number
  categoryBreakdown: { category: string; count: number }[]
}
