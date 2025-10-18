'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MapView } from '@/components/map-view'
import { EventList } from '@/components/event-list'
import { EventDetailModal } from '@/components/event-detail-modal'
import { LocationSearch } from '@/components/location-search'
import { FilterModal } from '@/components/filter-modal'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SlidersHorizontal, List } from 'lucide-react'
import { useSchool } from '@/lib/school-context'

export default function SchoolMapPage() {
  const school = useSchool()
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventList, setShowEventList] = useState(true)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(0.7)
  const [isMobile, setIsMobile] = useState(false)
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null)

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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTime, setSelectedTime] = useState<string>('all')
  const [selectedPrice, setSelectedPrice] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedCategory, selectedTime, selectedPrice })
  }

  const handleClearFilters = () => {
    setSelectedCategory('all')
    setSelectedTime('all')
    setSelectedPrice('all')
    setSearchQuery('')
  }

  const demoEvent = {
    id: '1',
    title: school.sampleEvents[0]?.title || 'Sample Event',
    description: 'Join us for this event.',
    startTime: school.sampleEvents[0]?.startTime || '2:00 PM',
    endTime: school.sampleEvents[0]?.endTime || '4:00 PM',
    venue: school.sampleEvents[0]?.venue || 'Campus',
    address: '123 Main St',
    category: school.sampleEvents[0]?.category || 'academic',
    organizer: school.sampleEvents[0]?.organizer || school.shortName,
    isFree: true,
    url: 'https://example.com',
  }

  const handleMarkerClick = (markerId: string) => {
    setSelectedEventId(markerId)
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
  }

  const handleLocationSelect = useCallback((longitude: number, latitude: number, placeName: string) => {
    if ((window as any).__mapFlyTo) {
      ;(window as any).__mapFlyTo(longitude, latitude)
    }
    
    if (isMobile) {
      setDrawerSnap(0.3)
    }
    
    console.log('Flying to:', placeName)
  }, [isMobile])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <header className="bg-background border-b px-4 py-3">
        <h1 className="text-lg md:text-xl font-bold">{school.shortName} Events</h1>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {showEventList && (
          <div className="hidden lg:block w-[400px] bg-background border-r">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b space-y-3 flex-shrink-0">
                <LocationSearch 
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search location..."
                />
                
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
                
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Today <span className="font-normal">Friday</span></h3>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <EventList
                  events={school.sampleEvents}
                  onEventClick={handleEventClick}
                  className="border-0 p-0 w-full bg-transparent"
                  showHeader={false}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <MapView
            markers={school.sampleMarkers}
            onMarkerClick={handleMarkerClick}
            onBoundsChange={(bounds) => {
              console.log('Bounds changed:', bounds)
            }}
            userLocation={userLocation}
            onFlyTo={(lng, lat) => {}}
          />
        </div>
      </div>

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
          <DrawerContent className="flex flex-col">
            <DrawerTitle className="sr-only">Events and Filters</DrawerTitle>
            
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
            
            <div className="px-4 pb-4 space-y-3 flex-shrink-0">
              <LocationSearch 
                onLocationSelect={handleLocationSelect}
                placeholder="Search location..."
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Events ({school.sampleEvents.length})</h2>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-[60vh] overflow-y-auto" align="end">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Quick Filters
                      </h3>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {['all', 'social', 'academic', 'career', 'arts', 'sports'].map((cat) => (
                            <Button 
                              key={cat}
                              variant={selectedCategory === cat ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setSelectedCategory(cat)}
                            >
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">When</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'all', label: 'All' },
                            { value: 'today', label: 'Today' },
                            { value: 'tomorrow', label: 'Tomorrow' },
                            { value: 'week', label: 'This Week' },
                            { value: 'weekend', label: 'Weekend' },
                          ].map((option) => (
                            <Button 
                              key={option.value}
                              variant={selectedTime === option.value ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setSelectedTime(option.value)}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Price</label>
                        <div className="flex gap-2">
                          {['all', 'free', 'paid'].map((price) => (
                            <Button 
                              key={price}
                              variant={selectedPrice === price ? 'default' : 'outline'} 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedPrice(price)}
                            >
                              {price.charAt(0).toUpperCase() + price.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => console.log('Applying filters...')}
                        >
                          Apply
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCategory('all')
                            setSelectedTime('all')
                            setSelectedPrice('all')
                            setSearchQuery('')
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              <EventList
                events={school.sampleEvents}
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

      <EventDetailModal
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        event={selectedEventId ? demoEvent : undefined}
      />
    </div>
  )
}

