import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ProductImage } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
}
