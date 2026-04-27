import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/public/product-card'
import { ProductGallery } from './gallery'
import { PrintButton } from './print-button'
import type { ProductImage } from '@/types'
import { ChevronRight, Building2, Package, Layers } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return products.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = true

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
  })
  if (!product) notFound()
  return { ...product, images: product.images as unknown as ProductImage[] }
}

async function getRelated(category: string, excludeId: string) {
  const products = await prisma.product.findMany({
    where: { category, isActive: true, id: { not: excludeId } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
  return products.map((p) => ({ ...p, images: p.images as unknown as ProductImage[] }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, genericName: true, description: true },
  })
  if (!product) return {}
  return {
    title: product.name,
    description: `${product.genericName} — ${product.description.slice(0, 155)}`,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug)
  const related = await getRelated(product.category, product.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl print-section">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 no-print">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogue" className="hover:text-foreground">Catalogue</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/catalogue?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge>{product.category}</Badge>
              {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
              {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.genericName}</p>
          </div>

          {/* Key info pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Form</p>
                <p className="font-medium">{product.form}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Layers className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Strength</p>
                <p className="font-medium">{product.strength}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Pack Size</p>
                <p className="font-medium">{product.packSize}</p>
              </div>
            </div>
          </div>

          {/* Manufacturer */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Manufactured by <span className="font-medium text-foreground">{product.manufacturer}</span></span>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <PrintButton />
        </div>
      </div>

      {/* Tabs: clinical info */}
      <ProductTabs product={product} />

      <Separator className="my-12" />

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Related Products in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductTabs({ product }: { product: Awaited<ReturnType<typeof getProduct>> }) {
  const sections = [
    { label: 'Overview', content: product.description },
    { label: 'Composition', content: product.composition },
    { label: 'Indications & Usage', content: product.indications },
    { label: 'Dosage', content: product.dosage },
    ...(product.sideEffects ? [{ label: 'Side Effects', content: product.sideEffects }] : []),
    ...(product.storage ? [{ label: 'Storage', content: product.storage }] : []),
  ]

  return (
    <div className="space-y-8">
      {sections.map(({ label, content }) => (
        <div key={label} className="print-section">
          <h2 className="text-lg font-semibold mb-3 text-primary">{label}</h2>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{content}</p>
          <Separator className="mt-6" />
        </div>
      ))}
    </div>
  )
}
