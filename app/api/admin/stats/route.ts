import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [totalProducts, activeProducts, featuredProducts, categoryGroups, totalManufacturers] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.product.groupBy({
          by: ['category'],
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
        }),
        prisma.product.findMany({
          select: { manufacturer: true },
          distinct: ['manufacturer'],
        }),
      ])

    return NextResponse.json({
      totalProducts,
      activeProducts,
      featuredProducts,
      totalCategories: categoryGroups.length,
      totalManufacturers: totalManufacturers.length,
      categoryBreakdown: categoryGroups.map((g) => ({
        category: g.category,
        count: g._count.category,
      })),
    })
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
