import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [categories, forms, manufacturers] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { form: true },
        distinct: ['form'],
        orderBy: { form: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { manufacturer: true },
        distinct: ['manufacturer'],
        orderBy: { manufacturer: 'asc' },
      }),
    ])

    return NextResponse.json({
      categories: categories.map((c) => c.category),
      forms: forms.map((f) => f.form),
      manufacturers: manufacturers.map((m) => m.manufacturer),
    })
  } catch (err) {
    console.error('Failed to fetch filter options:', err)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
