'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { EventList } from '@/components/event-list'
import { EventDetailSheet } from '@/components/event-detail-sheet'
import { DiningHallDetailSheet } from '@/components/dining-hall-detail-sheet'
import { FilterModal } from '@/components/filter-modal'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { SlidersHorizontal, List, Locate, Search, X, LogOut, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { DbEvent } from '@/lib/utils/transform'
import { Marker } from '@/types/event'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/client'
import { MobileNav } from '@/components/mobile-nav'

// Dynamic import for the heavy map component
const MapView = dynamic(
  () => import('@/components/map-view').then(mod => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-full">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
)

interface SchoolMapClientProps {
  events: DbEvent[]
  markers: Marker[]
  schoolSlug: string
  schoolName: string
  schoolHorizontalLogo: string | null
  campusCenter: { longitude: number; latitude: number }
  initialZoom: number
  initialBearing: number
  userRole: string | null
  isOrgAdmin: boolean
  avatarUrl: string | null
  organizationName: string | null
}

export default function SchoolMapClient({ events, markers, schoolSlug, schoolName, schoolHorizontalLogo, campusCenter, initialBearing, userRole, isOrgAdmin, avatarUrl, organizationName }: SchoolMapClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Determine if user is any kind of admin
  const isAdmin = userRole === 'super_admin' || isOrgAdmin

  // Determine dashboard URL
  const getDashboardUrl = () => {
    if (userRole === 'super_admin') return '/superadmin'
    if (isOrgAdmin) return '/admin'
    return null
  }

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedDiningHallId, setSelectedDiningHallId] = useState<string | null>(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(0.7)
  const [isMobile, setIsMobile] = useState(false)
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null)
  const [showRecenter, setShowRecenter] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  // Get filter values from URL
  const selectedCategory = searchParams.get('category') || 'all'
  const selectedTime = searchParams.get('time') || 'all'
  const selectedPrice = searchParams.get('price') || 'all'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    }
  }, [])

  // Update URL search params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/${schoolSlug}?${params.toString()}`)
  }

  const setSelectedCategory = (value: string) => updateFilter('category', value)
  const setSelectedTime = (value: string) => updateFilter('time', value)
  const setSelectedPrice = (value: string) => updateFilter('price', value)

  const handleApplyFilters = () => {
    // Filters are already applied via URL
    setFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    router.push(`/${schoolSlug}`)
  }

  const handleMarkerClick = (markerId: string) => {
    // Check if this is a dining hall marker (starts with 'dining-')
    if (markerId.startsWith('dining-')) {
      const diningHallId = markerId.replace('dining-', '')
      setSelectedDiningHallId(diningHallId)
      setSelectedEventId(null)
    } else {
      setSelectedEventId(markerId)
      setSelectedDiningHallId(null)
    }
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
  }

  const handleRecenter = useCallback(() => {
    if (window.__mapFlyTo) {
      window.__mapFlyTo(campusCenter.longitude, campusCenter.latitude)
    }
  }, [campusCenter])

  // Check if user is off-center to show/hide recenter button (mobile only)
  useEffect(() => {
    if (!isMobile) {
      setShowRecenter(false)
      return
    }

    const checkOffCenter = () => {
      const viewState = window.__mapViewState
      if (!viewState) return

      const lngDiff = Math.abs(viewState.longitude - campusCenter.longitude)
      const latDiff = Math.abs(viewState.latitude - campusCenter.latitude)
      const bearingDiff = Math.abs((viewState.bearing || 0) - (initialBearing || 0))

      const isOffCenter =
        lngDiff > 0.005 ||
        latDiff > 0.005 ||
        viewState.zoom < 14 ||
        bearingDiff > 5

      setShowRecenter(isOffCenter)
    }

    // Check every 500ms
    const interval = setInterval(checkOffCenter, 500)
    return () => clearInterval(interval)
  }, [isMobile, campusCenter, initialBearing])

  // Filter events based on search query
  const filteredEvents = searchQuery
    ? events.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events

  // Find selected event from events array
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : undefined

  // Profile Dropdown Component
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

            {/* Center - Organizations Link */}
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

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden bg-background">
        <div className="hidden lg:block w-sm bg-background">
            <div className="h-full flex flex-col">
              <div className="p-4 space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Events</h2>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterModalOpen(true)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                  </Button> */}
                </div>

                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />
              </div>


              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <EventList
                  events={filteredEvents}
                  schoolSlug={schoolSlug}
                  onEventClick={handleEventClick}
                  className="border-0 p-0 w-full bg-transparent"
                  showHeader={false}
                />
              </div>
            </div>
          </div>

        <div className="flex-1 relative bg-muted/30 rounded-tl-xl lg:rounded-tl-2xl overflow-hidden">
          <MapView
            markers={markers}
            onMarkerClick={handleMarkerClick}
            onBoundsChange={() => {}}
            userLocation={userLocation}
            onFlyTo={() => {}}
          />
        </div>
        </div>
      </div>


      {isMobile && showRecenter && (
        <button
          onClick={handleRecenter}
          className="fixed right-4 z-40 bg-background rounded-full p-3 shadow-lg border hover:bg-muted transition-colors"
          style={{
            bottom: `calc(${typeof drawerSnap === 'number' ? drawerSnap * 100 : 30}vh + 8px)`
          }}
          aria-label="Recenter to campus"
        >
          <Locate className="w-5 h-5" />
        </button>
      )}


      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDrawerSnap(0.3)
              setMobileDrawerOpen(true)
            } else {
              setMobileDrawerOpen(open)
              if (open) setDrawerSnap(0.7)
            }
          }}
          modal={false}
          snapPoints={[0.3, 0.7, 1.0]}
          activeSnapPoint={drawerSnap}
          setActiveSnapPoint={setDrawerSnap}
        >
          <DrawerContent className="flex flex-col h-full">
            <DrawerTitle className="sr-only">Events</DrawerTitle>

            <div className="px-4 pb-4 flex-shrink-0 pt-4">
              {searchExpanded ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSearchExpanded(false)
                      setSearchQuery('')
                    }}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Events</h2>
                  </div>
                  <button
                    onClick={() => setSearchExpanded(true)}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              <EventList
                events={filteredEvents}
                schoolSlug={schoolSlug}
                onEventClick={handleEventClick}
                className="border-0 p-0 w-full bg-transparent"
                showHeader={false}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <EventDetailSheet
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        event={selectedEvent}
        schoolSlug={schoolSlug}
      />

      <DiningHallDetailSheet
        isOpen={selectedDiningHallId !== null}
        onClose={() => setSelectedDiningHallId(null)}
        diningHallId={selectedDiningHallId}
        schoolSlug={schoolSlug}
      />
    </div>
  )
}
