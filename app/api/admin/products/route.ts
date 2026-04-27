import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
import { createAuditLog, getClientIp } from '@/lib/audit'
import { slugify } from '@/lib/utils'
import type { ProductImage } from '@/types'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? undefined
  const category = searchParams.get('category') ?? undefined
  const status = searchParams.get('status') ?? 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { genericName: { contains: search, mode: 'insensitive' as const } },
        { manufacturer: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { category }),
    ...(status === 'active' && { isActive: true }),
    ...(status === 'inactive' && { isActive: false }),
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: products.map((p) => ({ ...p, images: p.images as unknown as ProductImage[] })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Failed to fetch admin products:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
  }

  const data = parsed.data

  try {
    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (existingSlug) {
      data.slug = slugify(`${data.slug}-${Date.now()}`)
    }

    const product = await prisma.product.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        name: data.name,
        slug: data.slug,
        genericName: data.genericName,
        manufacturer: data.manufacturer,
        category: data.category,
        subcategory: data.subcategory ?? null,
        form: data.form,
        strength: data.strength,
        packSize: data.packSize,
        description: data.description,
        composition: data.composition,
        indications: data.indications,
        dosage: data.dosage,
        sideEffects: data.sideEffects ?? null,
        storage: data.storage ?? null,
        images: data.images,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        tags: data.tags,
      },
    })

    await createAuditLog({
      adminId: session.user.id,
      action: 'CREATE',
      target: `Product: ${product.name} (${product.id})`,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('Failed to create product:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
