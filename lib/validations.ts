import { z } from 'zod'

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  genericName: z.string().min(2, 'Generic name required').max(200),
  manufacturer: z.string().min(2, 'Manufacturer required').max(200),
  category: z.string().min(2, 'Category required').max(100),
  subcategory: z.string().max(100).optional().default(''),
  form: z.string().min(2, 'Form required').max(50),
  strength: z.string().min(1, 'Strength required').max(100),
  packSize: z.string().min(1, 'Pack size required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  composition: z.string().min(5, 'Composition required'),
  indications: z.string().min(5, 'Indications required'),
  dosage: z.string().min(5, 'Dosage information required'),
  sideEffects: z.string().optional().default(''),
  storage: z.string().optional().default(''),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        original: z.string(),
        thumb: z.string(),
      })
    )
    .default([]),
})

export type ProductFormData = z.infer<typeof productSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
  isActive: z.enum(['true', 'false', 'all']).optional(),
  isFeatured: z.enum(['true', 'false', 'all']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  sort: z.enum(['name_asc', 'name_desc', 'newest', 'oldest']).optional().default('newest'),
})

export type ProductFilter = z.infer<typeof productFilterSchema>
