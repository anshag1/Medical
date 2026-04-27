'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center text-6xl">
        💊
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        <Image
          src={images[selected]?.original ?? images[selected]?.thumb}
          alt={name}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.thumb}
              onClick={() => setSelected(idx)}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all',
                selected === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img.thumb}
                alt={`${name} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
