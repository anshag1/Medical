import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productFilterSchema } from '@/lib/validations'
import type { ProductImage } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const filter = productFilterSchema.safeParse({
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    form: searchParams.get('form') ?? undefined,
    manufacturer: searchParams.get('manufacturer') ?? undefined,
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 12,
    sort: searchParams.get('sort') ?? 'newest',
  })

  if (!filter.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const { search, category, form, manufacturer, page, limit, sort } = filter.data

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { genericName: { contains: search, mode: 'insensitive' as const } },
        { manufacturer: { contains: search, mode: 'insensitive' as const } },
        { tags: { has: search } },
      ],
    }),
    ...(category && { category }),
    ...(form && { form }),
    ...(manufacturer && { manufacturer }),
  }

  const orderBy =
    sort === 'name_asc'
      ? { name: 'asc' as const }
      : sort === 'name_desc'
        ? { name: 'desc' as const }
        : sort === 'oldest'
          ? { createdAt: 'asc' as const }
          : { createdAt: 'desc' as const }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          genericName: true,
          manufacturer: true,
          category: true,
          subcategory: true,
          form: true,
          strength: true,
          packSize: true,
          images: true,
          isFeatured: true,
          isActive: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: products.map((p) => ({
        ...p,
        images: p.images as unknown as ProductImage[],
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
