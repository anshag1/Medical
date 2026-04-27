import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/public/hero'
import { ProductCard } from '@/components/public/product-card'
import { Badge } from '@/components/ui/badge'
import type { ProductImage } from '@/types'
import {
  Package,
  Layers,
  Building2,
  ChevronRight,
  Pill,
  Heart,
  Shield,
  Sun,
  Droplet,
  Activity,
} from 'lucide-react'

const categoryIcons: Record<string, React.ElementType> = {
  Antibiotics: Shield,
  Analgesics: Pill,
  'Vitamins & Supplements': Sun,
  Cardiovascular: Heart,
  Dermatology: Droplet,
}

const FallbackIcon = Activity

async function getHomeData() {
  const [featured, stats, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
    Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { category: true }, distinct: ['category'] }),
      prisma.product.findMany({ where: { isActive: true }, select: { manufacturer: true }, distinct: ['manufacturer'] }),
    ]),
    prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6,
    }),
  ])

  return {
    featured: featured.map((p) => ({ ...p, images: p.images as unknown as ProductImage[] })),
    totalProducts: stats[0],
    totalCategories: stats[1].length,
    totalManufacturers: stats[2].length,
    categories,
  }
}

export default async function HomePage() {
  const { featured, totalProducts, totalCategories, totalManufacturers, categories } =
    await getHomeData()

  return (
    <div className="space-y-16">
      <Hero />

      {/* Stats bar */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-6 rounded-xl border bg-card p-6 shadow-sm">
          {[
            { icon: Package, label: 'Products', value: totalProducts },
            { icon: Layers, label: 'Categories', value: totalCategories },
            { icon: Building2, label: 'Manufacturers', value: totalManufacturers },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories quick-links */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map(({ category, _count }) => {
              const Icon = categoryIcons[category] ?? FallbackIcon
              return (
                <Link
                  key={category}
                  href={`/catalogue?category=${encodeURIComponent(category)}`}
                  className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium leading-tight">{category}</span>
                  <Badge variant="secondary" className="text-xs">{_count.category}</Badge>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              href="/catalogue"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
