'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Pill,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-200 hidden md:flex',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 gap-3">
        <Pill className="h-6 w-6 text-primary flex-shrink-0" />
        {!collapsed && (
          <span className="font-bold text-sm truncate">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? 'MediCatalogue'} Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* View site */}
      <div className="p-2 border-t">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  )
}
