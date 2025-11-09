'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface SuperAdminNavProps {
  user: { id: string; email?: string }
  breadcrumbs?: BreadcrumbItem[]
}

export default function SuperAdminNav({ user, breadcrumbs: propBreadcrumbs }: SuperAdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[] | undefined>(propBreadcrumbs)

  // Check for breadcrumbs from global scope (set by nested layouts)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const globalBreadcrumbs = typeof window !== 'undefined'
        ? (window as Window & { __superadmin_breadcrumbs?: BreadcrumbItem[] | null }).__superadmin_breadcrumbs
        : null

      if (globalBreadcrumbs) {
        setBreadcrumbs(globalBreadcrumbs)
      } else if (!propBreadcrumbs) {
        setBreadcrumbs(undefined)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [propBreadcrumbs])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/superadmin', label: 'Overview' },
    { href: '/superadmin/organizations', label: 'Organizations' },
    { href: '/superadmin/schools', label: 'Schools' },
    { href: '/superadmin/events', label: 'Events' },
    { href: '/superadmin/settings', label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/superadmin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      {/* Top bar with breadcrumb/project name and user */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <Link href="/superadmin" className="font-semibold hover:underline">
                  HapMap
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Link href="/superadmin" className="font-semibold text-lg" prefetch={true}>
                HapMap
              </Link>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'text-sm py-3 border-b-2 transition-colors whitespace-nowrap',
                isActive(item.href)
                  ? 'border-foreground font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
