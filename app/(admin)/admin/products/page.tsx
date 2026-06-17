import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductsTable } from '@/components/admin/products-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Search } from 'lucide-react'
import type { Product, ProductImage } from '@/types'

interface Props {
  searchParams: {
    search?: string
    category?: string
    status?: string
    page?: string
  }
}

async function getProducts(searchParams: Props['searchParams']) {
  const search = searchParams.search
  const category = searchParams.category === 'all' ? undefined : searchParams.category
  const status = searchParams.status ?? 'all'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
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

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  return {
    products: products.map((p) => ({ ...p, images: p.images as unknown as ProductImage[] })) as Product[],
    total,
    totalPages: Math.ceil(total / limit),
    page,
    categories: categories.map((c) => c.category),
  }
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { products, total, totalPages, page, categories } = await getProducts(searchParams)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{total} total products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3" method="GET">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search products…"
              className="pl-9 w-60"
            />
          </div>

          <Select name="category" defaultValue={searchParams.category ?? 'all'}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="status" defaultValue={searchParams.status ?? 'all'}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline" size="sm">
            Filter
          </Button>
          {(searchParams.search || (searchParams.category && searchParams.category !== 'all') || (searchParams.status && searchParams.status !== 'all')) && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">Clear</Link>
            </Button>
          )}
        </form>
      </div>

      <ProductsTable products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products?page=${page - 1}&${new URLSearchParams({ ...searchParams, page: undefined as unknown as string }).toString()}`}>
                Previous
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products?page=${page + 1}&${new URLSearchParams({ ...searchParams }).toString()}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
