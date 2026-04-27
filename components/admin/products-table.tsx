'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteModal } from '@/components/admin/delete-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductsTableProps {
  products: Product[]
  loading?: boolean
}

export function ProductsTable({ products, loading }: ProductsTableProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleToggle(
    product: Product,
    field: 'isActive' | 'isFeatured',
    value: boolean
  ) {
    setTogglingId(`${product.id}-${field}`)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, [field]: value }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success(`${field === 'isActive' ? 'Status' : 'Featured'} updated`)
      router.refresh()
    } catch {
      toast.error('Failed to update product')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    toast.success(`"${product.name}" deleted`)
    setDeleteTarget(null)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found. <Link href="/admin/products/new" className="text-primary hover:underline">Add one?</Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Generic Name</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Form</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="hidden xl:table-cell">Created</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                    {product.images[0]?.thumb ? (
                      <Image
                        src={product.images[0].thumb}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-lg">💊</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{product.genericName}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{product.form}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.isActive}
                    disabled={togglingId === `${product.id}-isActive`}
                    onCheckedChange={(val) => handleToggle(product, 'isActive', val)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.isFeatured}
                    disabled={togglingId === `${product.id}-isFeatured`}
                    onCheckedChange={(val) => handleToggle(product, 'isFeatured', val)}
                  />
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  {formatDate(product.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </>
  )
}
