import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ProductImage } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!/^[a-z0-9-]{2,200}$/.test(params.slug)) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, isActive: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...product,
      images: product.images as unknown as ProductImage[],
    })
  } catch (err) {
    console.error('Failed to fetch product:', err)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
