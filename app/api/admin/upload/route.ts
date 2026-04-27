import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_IMAGE_SIZE_MB ?? '5')) * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const productId = formData.get('productId') as string | null

  if (!file || !productId) {
    return NextResponse.json({ error: 'file and productId are required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are accepted' }, { status: 415 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `File exceeds ${process.env.MAX_IMAGE_SIZE_MB ?? 5}MB limit` }, { status: 413 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const dir = path.join(process.cwd(), 'public', 'uploads', 'products', productId)
  await fs.mkdir(dir, { recursive: true })

  const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const filename = `${uniquePart}.webp`
  const thumbname = `thumb-${uniquePart}.webp`

  await Promise.all([
    sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(dir, filename)),
    sharp(buffer)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(dir, thumbname)),
  ])

  return NextResponse.json({
    original: `/uploads/products/${productId}/${filename}`,
    thumb: `/uploads/products/${productId}/${thumbname}`,
  })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const filePath = (body as { path?: string })?.path
  if (!filePath || typeof filePath !== 'string') {
    return NextResponse.json({ error: 'path is required' }, { status: 400 })
  }

  // Security: resolve to absolute path and verify it stays within public/uploads/
  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')
  const absolutePath = path.resolve(
    process.cwd(),
    'public',
    filePath.replace(/^\//, '')
  )
  if (!absolutePath.startsWith(uploadsRoot + path.sep) && absolutePath !== uploadsRoot) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  // Derive thumb path
  const dir = path.dirname(absolutePath)
  const base = path.basename(absolutePath)
  const thumbPath = path.join(dir, `thumb-${base}`)

  await Promise.all([
    fs.unlink(absolutePath).catch(() => null),
    fs.unlink(thumbPath).catch(() => null),
  ])

  return NextResponse.json({ success: true })
}
