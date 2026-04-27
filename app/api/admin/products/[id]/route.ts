import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
import { createAuditLog, getClientIp } from '@/lib/audit'
import fs from 'fs/promises'
import path from 'path'
import type { ProductImage } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...product, images: product.images as unknown as ProductImage[] })
  } catch (err) {
    console.error('Failed to fetch product:', err)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.product.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
    if (data.slug !== existing.slug) {
      const slugConflict = await prisma.product.findFirst({
        where: { slug: data.slug, id: { not: params.id } },
      })
      if (slugConflict) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
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
      action: 'UPDATE',
      target: `Product: ${product.name} (${product.id})`,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({ ...product, images: product.images as unknown as ProductImage[] })
  } catch (err) {
    console.error('Failed to update product:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.product.delete({ where: { id: params.id } })

    const imageDir = path.join(process.cwd(), 'public', 'uploads', 'products', params.id)
    await fs.rm(imageDir, { recursive: true, force: true }).catch(() => null)

    await createAuditLog({
      adminId: session.user.id,
      action: 'DELETE',
      target: `Product: ${product.name} (${params.id})`,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
