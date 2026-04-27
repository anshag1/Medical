'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/public/product-card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product } from '@/types'

interface FilterOptions {
  categories: string[]
  forms: string[]
  manufacturers: string[]
}

interface PaginatedProducts {
  data: Product[]
  total: number
  totalPages: number
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function CataloguePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(search, 400)
  const [filters, setFilters] = useState<FilterOptions>({ categories: [], forms: [], manufacturers: [] })
  const [products, setProducts] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const category = searchParams.get('category') ?? ''
  const form = searchParams.get('form') ?? ''
  const manufacturer = searchParams.get('manufacturer') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'
  const page = parseInt(searchParams.get('page') ?? '1')

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: FilterOptions) => setFilters(data))
      .catch(() => null)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
        ...(form && { form }),
        ...(manufacturer && { manufacturer }),
        sort,
        page: String(page),
        limit: '12',
      })
      const res = await fetch(`/api/products?${params}`)
      const data: PaginatedProducts = await res.json()
      setProducts(data)
    } catch {
      setProducts(null)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, form, manufacturer, sort, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    // Read current params from the URL directly to avoid a circular dep on searchParams
    const current = new URLSearchParams(window.location.search)
    if (debouncedSearch) current.set('search', debouncedSearch)
    else current.delete('search')
    current.set('page', '1')
    router.replace(`${pathname}?${current.toString()}`, { scroll: false })
  }, [debouncedSearch, pathname, router])

  const activeFilters = [
    category && { key: 'category', label: category },
    form && { key: 'form', label: form },
    manufacturer && { key: 'manufacturer', label: manufacturer },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0 space-y-6`}
        >
          <div className="flex items-center justify-between md:hidden">
            <h2 className="font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category filter */}
          {filters.categories.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Category</h3>
              <div className="space-y-2">
                {filters.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParams({ category: category === cat ? '' : cat })}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Form filter */}
          {filters.forms.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Form</h3>
              <div className="space-y-2">
                {filters.forms.map((f) => (
                  <button
                    key={f}
                    onClick={() => updateParams({ form: form === f ? '' : f })}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      form === f
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Manufacturer filter */}
          {filters.manufacturers.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Manufacturer</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filters.manufacturers.map((m) => (
                  <button
                    key={m}
                    onClick={() => updateParams({ manufacturer: manufacturer === m ? '' : m })}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors truncate ${
                      manufacturer === m
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Top bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, generic name, or manufacturer…"
                className="pl-9"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(({ key, label }) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => updateParams({ [key]: '' })}
                >
                  {label} <X className="h-3 w-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(pathname)}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results count */}
          {!loading && products && (
            <p className="text-sm text-muted-foreground">
              {products.total} product{products.total !== 1 ? 's' : ''} found
            </p>
          )}

          {/* Grid / List */}
          {loading ? (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-3'
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={view === 'grid' ? 'h-64' : 'h-20'} />
              ))}
            </div>
          ) : products && products.data.length > 0 ? (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-3'
              }
            >
              {products.data.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}

          {/* Pagination */}
          {products && products.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {products.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= products.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
