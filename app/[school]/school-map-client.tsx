'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { EventList } from '@/components/event-list'
import { EventDetailSheet } from '@/components/event-detail-sheet'
import { FilterModal } from '@/components/filter-modal'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SlidersHorizontal, List, Locate, Search, X, LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

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
  events: any[]
  markers: any[]
  schoolSlug: string
  campusCenter: { longitude: number; latitude: number }
  initialZoom: number
  initialBearing: number
  userRole: string | null
  isOrgAdmin: boolean
}

export default function SchoolMapClient({ events, markers, schoolSlug, campusCenter, initialZoom, initialBearing, userRole, isOrgAdmin }: SchoolMapClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine if user is any kind of admin
  const isAdmin = userRole === 'super_admin' || isOrgAdmin

  // Determine dashboard URL
  const getDashboardUrl = () => {
    if (userRole === 'super_admin') return '/superadmin'
    if (isOrgAdmin) return '/admin'
    return null
  }

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventList, setShowEventList] = useState(true)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(0.7)
  const [isMobile, setIsMobile] = useState(false)
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null)
  const [showRecenter, setShowRecenter] = useState(false)
  const [mapViewState, setMapViewState] = useState<any>(null)
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
    if (isMobile) {
      // On mobile, navigate to event page
      router.push(`/${schoolSlug}/events/${markerId}`)
    } else {
      // On desktop, open sheet
      setSelectedEventId(markerId)
    }
  }

  const handleEventClick = (eventId: string) => {
    if (isMobile) {
      // On mobile, navigate to event page
      router.push(`/${schoolSlug}/events/${eventId}`)
    } else {
      // On desktop, open sheet
      setSelectedEventId(eventId)
    }
  }

  const handleRecenter = useCallback(() => {
    if ((window as any).__mapFlyTo) {
      ;(window as any).__mapFlyTo(campusCenter.longitude, campusCenter.latitude)
    }
  }, [campusCenter])

  // Check if user is off-center to show/hide recenter button (mobile only)
  useEffect(() => {
    if (!isMobile) {
      setShowRecenter(false)
      return
    }

    const checkOffCenter = () => {
      const viewState = (window as any).__mapViewState
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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <header className="hidden lg:block bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold">{schoolSlug.toUpperCase()} Events</h1>
          {isAdmin && getDashboardUrl() && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(getDashboardUrl()!)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Admin Dashboard
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden bg-background">
        {showEventList && (
          <div className="hidden lg:block w-sm bg-background">
            <div className="h-full flex flex-col">
              <div className="p-4 space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Events</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterModalOpen(true)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                  </Button>
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
        )}

        <div className="flex-1 relative bg-muted/30 rounded-tl-xl lg:rounded-tl-2xl overflow-hidden">
          <MapView
            markers={markers}
            onMarkerClick={handleMarkerClick}
            onBoundsChange={(bounds) => {
              console.log('Bounds changed:', bounds)
            }}
            userLocation={userLocation}
            onFlyTo={(lng, lat) => {}}
          />
        </div>
        </div>
      </div>

      {isMobile && (
        <button
          onClick={() => setFilterModalOpen(true)}
          className="fixed top-4 left-4 z-40 bg-background rounded-full px-4 py-2 shadow-lg border hover:bg-muted transition-colors flex items-center gap-2"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {(selectedCategory !== 'all' || selectedTime !== 'all' || selectedPrice !== 'all') && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {[selectedCategory !== 'all', selectedTime !== 'all', selectedPrice !== 'all'].filter(Boolean).length}
            </span>
          )}
        </button>
      )}

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

      {/* Login button - shown when user is not logged in */}
      {!userRole && !isOrgAdmin && (
        <button
          onClick={() => router.push('/auth/login')}
          className="fixed top-4 right-4 z-40 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
          aria-label="Login"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-sm">Login</span>
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
      />
    </div>
  )
}
