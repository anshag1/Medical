import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/product-form'
import { prisma } from '@/lib/prisma'
import type { Product, ProductImage } from '@/types'

interface Props {
  params: { id: string }
}

async function getProduct(id: string): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()
  return { ...product, images: product.images as unknown as ProductImage[] }
}

async function getCategories() {
  const cats = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  return cats.map((c) => c.category)
}

export default async function EditProductPage({ params }: Props) {
  const [product, categories] = await Promise.all([
    getProduct(params.id),
    getCategories(),
  ])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <ProductForm productId={params.id} initialData={product} existingCategories={categories} />
    </div>
  )
}
