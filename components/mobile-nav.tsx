'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  schoolSlug: string
}

export function MobileNav({ schoolSlug }: MobileNavProps) {
  const pathname = usePathname()

  const isMapView = pathname === `/${schoolSlug}`
  const isListView = pathname === `/${schoolSlug}/list`

  const navItems = [
    {
      href: `/${schoolSlug}`,
      icon: MapPin,
      label: 'Map',
      active: isMapView,
    },
    {
      href: `/${schoolSlug}/list`,
      icon: List,
      label: 'List',
      active: isListView,
    },
  ]

  return (
    <nav className="lg:hidden bg-background/95 backdrop-blur px-3 py-1.5">
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full border whitespace-nowrap transition-colors",
                item.active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:bg-muted"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
