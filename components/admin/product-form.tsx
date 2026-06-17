'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'

import { productSchema, type ProductFormData } from '@/lib/validations'
import { slugify } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product, ProductImage } from '@/types'

// Loaded client-only — avoids hydration mismatch caused by browser file APIs
// and next/image fill-mode differing between server and client renders.
const ImageUploader = dynamic(
  () => import('@/components/admin/image-uploader').then((m) => m.ImageUploader),
  {
    ssr: false,
    loading: () => (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
        Loading uploader…
      </div>
    ),
  }
)

const FORM_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Powder', 'Gel', 'Solution', 'Suspension']
const COMMON_CATEGORIES = ['Antibiotics', 'Analgesics', 'Vitamins & Supplements', 'Cardiovascular', 'Dermatology', 'Antivirals', 'Antifungals', 'Antidiabetics', 'Antihistamines', 'Gastrointestinal']

interface ProductFormProps {
  productId: string
  initialData?: Product
  existingCategories?: string[]
}

export function ProductForm({ productId, initialData, existingCategories = [] }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [slugManual, setSlugManual] = useState(!!initialData)

  const allCategories = Array.from(new Set([...COMMON_CATEGORIES, ...existingCategories])).sort()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          subcategory: initialData.subcategory ?? '',
          sideEffects: initialData.sideEffects ?? '',
          storage: initialData.storage ?? '',
          images: initialData.images as unknown as ProductImage[],
        }
      : {
          name: '',
          slug: '',
          genericName: '',
          manufacturer: '',
          category: '',
          subcategory: '',
          form: '',
          strength: '',
          packSize: '',
          description: '',
          composition: '',
          indications: '',
          dosage: '',
          sideEffects: '',
          storage: '',
          isFeatured: false,
          isActive: true,
          tags: [],
          images: [],
        },
  })

  function handleNameChange(value: string) {
    form.setValue('name', value)
    if (!slugManual) {
      form.setValue('slug', slugify(value), { shouldValidate: true })
    }
  }

  function addTag() {
    const tag = tagInput.trim()
    if (!tag) return
    const current = form.getValues('tags')
    if (!current.includes(tag)) {
      form.setValue('tags', [...current, tag])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    form.setValue('tags', form.getValues('tags').filter((t) => t !== tag))
  }

  async function onSubmit(data: ProductFormData) {
    setLoading(true)
    try {
      const url = initialData ? `/api/admin/products/${productId}` : '/api/admin/products'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: productId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error((err as { error?: string }).error ?? 'Request failed')
      }

      toast.success(initialData ? 'Product updated' : 'Product created')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Amoxicillin 500mg Capsules"
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>URL Slug *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="auto-generated-from-name"
                      onChange={(e) => {
                        setSlugManual(true)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genericName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generic Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Amoxicillin" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. GlaxoSmithKline" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional subcategory" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORM_TYPES.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strength *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 500mg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Size *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 10 capsules/strip" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'description' as const, label: 'Description *', placeholder: 'Brief product description' },
              { name: 'composition' as const, label: 'Composition *', placeholder: 'List active and inactive ingredients' },
              { name: 'indications' as const, label: 'Indications *', placeholder: 'What conditions this medicine treats' },
              { name: 'dosage' as const, label: 'Dosage *', placeholder: 'Recommended dosage and administration' },
              { name: 'sideEffects' as const, label: 'Side Effects', placeholder: 'Known side effects (optional)' },
              { name: 'storage' as const, label: 'Storage', placeholder: 'Storage conditions (optional)' },
            ].map(({ name, label, placeholder }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={placeholder} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      productId={productId}
                      images={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-8">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-medium">Active</FormLabel>
                      <p className="text-xs text-muted-foreground">Visible on public catalogue</p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-medium">Featured</FormLabel>
                      <p className="text-xs text-muted-foreground">Shown on homepage</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag() }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
