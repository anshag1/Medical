'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ImageUploaderProps {
  productId: string
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export function ImageUploader({
  productId,
  images: imagesProp,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const images = imagesProp ?? []
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = useCallback(async (file: File): Promise<ProductImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error((err as { error?: string }).error ?? 'Upload failed')
    }
    return (await res.json()) as ProductImage
  }, [productId])

  const handleFiles = useCallback(async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)

    setUploading(true)
    try {
      const uploaded = await Promise.all(toUpload.map(uploadFile))
      onChange([...images, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onChange, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    setDragOver(false)
    void handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleRemove = useCallback(async (index: number): Promise<void> => {
    const image = images[index]
    try {
      await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: image.original }),
      })
    } catch {
      // Non-fatal — file may already be deleted or upload may have failed
    }
    onChange(images.filter((_, i) => i !== index))
  }, [images, onChange])

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => void handleFiles(e.target.files)}
              disabled={uploading}
            />
            <div className="space-y-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {uploading ? 'Uploading…' : 'Drop images here or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP · Max 5 MB each · Up to {maxImages} images
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div key={img.original} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
              <Image
                src={img.thumb}
                alt={`Image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs text-center py-0.5">
                  Main
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => void handleRemove(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images · First image is the main display image
        </p>
      )}
    </div>
  )
}
