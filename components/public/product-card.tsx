import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'genericName' | 'manufacturer' | 'form' | 'strength' | 'category' | 'images'>
  view?: 'grid' | 'list'
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const thumb = product.images[0]?.thumb
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'MediCatalogue'

  if (view === 'list') {
    return (
      <Link href={`/catalogue/${product.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex gap-4 items-center">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{product.genericName}</p>
              <p className="text-xs text-muted-foreground truncate">{product.manufacturer}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Badge variant="secondary">{product.form}</Badge>
              <Badge variant="outline">{product.category}</Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/catalogue/${product.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col overflow-hidden">
        <div className="relative aspect-video bg-muted">
          {thumb ? (
            <Image
              src={thumb}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl">💊</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">{product.form}</Badge>
            <Badge variant="outline" className="text-xs">{product.category}</Badge>
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{product.genericName}</p>
          <p className="text-xs text-muted-foreground mt-auto">{product.manufacturer}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
