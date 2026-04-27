import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Activity, Star, Layers, PlusCircle, ExternalLink } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { CategoryChart } from '@/components/admin/category-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditLog } from '@/types'

async function getDashboardData() {
  const [totalProducts, activeProducts, featuredProducts, categoryGroups, recentLogs] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { admin: { select: { name: true, email: true } } },
      }),
    ])

  return {
    totalProducts,
    activeProducts,
    featuredProducts,
    totalCategories: categoryGroups.length,
    categoryBreakdown: categoryGroups.map((g) => ({
      category: g.category,
      count: g._count.category,
    })),
    recentLogs: recentLogs as AuditLog[],
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {session?.user.name}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/catalogue" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={data.totalProducts} icon={Package} />
        <StatsCard title="Active Products" value={data.activeProducts} icon={Activity} description="Visible on catalogue" />
        <StatsCard title="Featured" value={data.featuredProducts} icon={Star} description="Shown on homepage" />
        <StatsCard title="Categories" value={data.totalCategories} icon={Layers} />
      </div>

      {/* Chart + Audit log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLogTable logs={data.recentLogs} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
