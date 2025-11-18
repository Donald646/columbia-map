'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { EventList } from '@/components/event-list'
import { EventDetailSheet } from '@/components/event-detail-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LogOut, Settings } from 'lucide-react'
import { DbEvent } from '@/lib/utils/transform'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/client'
import { MobileNav } from '@/components/mobile-nav'

interface ListViewClientProps {
  events: DbEvent[]
  schoolSlug: string
  schoolName: string
  schoolHorizontalLogo: string | null
  userRole: string | null
  isOrgAdmin: boolean
  avatarUrl: string | null
  organizationName: string | null
}

export default function ListViewClient({
  events,
  schoolSlug,
  schoolName,
  schoolHorizontalLogo,
  userRole,
  isOrgAdmin,
  avatarUrl,
  organizationName,
}: ListViewClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const getDashboardUrl = () => {
    if (userRole === 'super_admin') return '/superadmin'
    if (isOrgAdmin) return '/admin'
    return null
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const ProfileDropdown = ({ size = 'default' }: { size?: 'default' | 'small' }) => {
    const avatarSize = size === 'small' ? 'w-8 h-8' : 'w-9 h-9'
    const innerSize = size === 'small' ? 'w-7 h-7' : 'w-8 h-8'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`${avatarSize} rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer`}
            aria-label="Profile menu"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={size === 'small' ? 32 : 36}
                height={size === 'small' ? 32 : 36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className={`${innerSize} rounded-full bg-background border-2 border-muted-foreground/20 flex items-center justify-center`}>
                <span className="text-xs font-medium text-muted-foreground">
                  {userRole ? userRole.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {userRole === 'super_admin' && (
            <DropdownMenuItem onClick={() => router.push('/superadmin')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Super Admin Dashboard</span>
            </DropdownMenuItem>
          )}
          {isOrgAdmin && organizationName && (
            <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Manage {organizationName}</span>
            </DropdownMenuItem>
          )}
          {(userRole === 'super_admin' || isOrgAdmin) && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const filteredEvents = searchQuery
    ? events.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : undefined

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Desktop Header */}
      <header className="hidden lg:block bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between relative">
            <Link href={`/${schoolSlug}`} className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
              <span className="font-bold text-xl tracking-tight">EventsCU</span>
              {schoolHorizontalLogo ? (
                <>
                  <span className="text-muted-foreground/40">|</span>
                  <div className="relative h-8 w-auto max-w-[200px]">
                    <Image
                      src={schoolHorizontalLogo}
                      alt={schoolName}
                      width={200}
                      height={32}
                      className="object-contain h-full w-auto"
                      priority
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground/40">|</span>
                  <span className="text-sm font-medium text-muted-foreground">{schoolName}</span>
                </>
              )}
            </Link>

            <Link
              href={`/${schoolSlug}/organizations`}
              className="absolute left-1/2 -translate-x-1/2 text-sm font-medium hover:text-foreground transition-colors text-muted-foreground"
            >
              Organizations
            </Link>

            <div className="flex items-center gap-2">
              {userRole || isOrgAdmin ? (
                <ProfileDropdown />
              ) : (
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="default"
                  size="sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/${schoolSlug}`} className="flex items-center gap-2.5">
              <span className="font-bold text-lg tracking-tight">VENU</span>
              {schoolHorizontalLogo ? (
                <div className="relative h-6 w-auto max-w-[150px]">
                  <Image
                    src={schoolHorizontalLogo}
                    alt={schoolName}
                    width={150}
                    height={24}
                    className="object-contain h-full w-auto"
                    priority
                  />
                </div>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">{schoolName}</span>
              )}
            </Link>

            {userRole || isOrgAdmin ? (
              <ProfileDropdown size="small" />
            ) : (
              <Button
                onClick={() => router.push('/auth/login')}
                variant="default"
                size="sm"
                className="text-xs px-3 py-1 h-8"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Pills */}
      <MobileNav schoolSlug={schoolSlug} />

      <div className="flex-1 overflow-hidden bg-background">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="p-4 lg:p-6 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl lg:text-3xl font-bold">Events</h1>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6">
            <EventList
              events={filteredEvents}
              schoolSlug={schoolSlug}
              onEventClick={setSelectedEventId}
              className="border-0 p-0 w-full bg-transparent"
              showHeader={false}
            />
          </div>
        </div>
      </div>

      <EventDetailSheet
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        event={selectedEvent}
        schoolSlug={schoolSlug}
      />
    </div>
  )
}
