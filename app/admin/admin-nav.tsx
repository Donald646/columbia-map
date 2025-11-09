'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DbOrganization } from '@/types/database-helpers'

interface AdminNavProps {
  user: { id: string; email?: string }
  organizations: DbOrganization[]
}

export default function AdminNav({ user, organizations }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/events', label: 'Events' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Show first organization in breadcrumb
  const displayOrganization = organizations.length > 0 ? organizations[0] : null

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      {/* Top bar with breadcrumb and user */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="font-semibold hover:underline">
                HapMap
              </Link>
              {displayOrganization && (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{displayOrganization.name}</span>
                </>
              )}
            </div>

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
