import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/product-form'
import { prisma } from '@/lib/prisma'
import { generateId } from '@/lib/utils'

async function getCategories() {
  const cats = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  return cats.map((c) => c.category)
}

export default async function NewProductPage() {
  const [categories, productId] = await Promise.all([
    getCategories(),
    Promise.resolve(generateId()),
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
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to add a product to the catalogue</p>
        </div>
      </div>

      <ProductForm productId={productId} existingCategories={categories} />
    </div>
  )
}
