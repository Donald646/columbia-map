'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Share2, ExternalLink, UtensilsCrossed, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getGoogleMapsUrl } from '@/lib/utils/transform'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { format, addDays } from 'date-fns'

interface DiningHall {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  image_url: string | null
  description: string | null
}

interface DiningHallDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  diningHallId: string | null
  schoolSlug: string
}

interface OperatingHours {
  day_of_week: number
  meal_type: string
  opens_at: string
  closes_at: string
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  station_name: string | null
  allergens: string[] | null
  dietary_prefs: string[] | null
}

interface MenuSchedule {
  id: string
  date: string
  meal_type: string
  starts_at: string
  ends_at: string
  display_order: number
  menu_items: MenuItem[]
}

export function DiningHallDetailSheet({
  isOpen,
  onClose,
  diningHallId,
  schoolSlug
}: DiningHallDetailSheetProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [diningHall, setDiningHall] = useState<DiningHall | null>(null)
  const [hours, setHours] = useState<OperatingHours[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [menus, setMenus] = useState<MenuSchedule[]>([])
  const [loadingMenus, setLoadingMenus] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (diningHallId && isOpen) {
      loadDiningHallDetails()
    }
  }, [diningHallId, isOpen])

  useEffect(() => {
    if (diningHallId && isOpen) {
      loadMenus()
    }
  }, [selectedDate, diningHallId, isOpen])

  async function loadDiningHallDetails() {
    if (!diningHallId) return
    setLoading(true)

    try {
      // Fetch dining hall
      const { data: hall } = await supabase
        .from('dining_halls')
        .select('*')
        .eq('id', diningHallId)
        .single()

      // Fetch operating hours
      const { data: operatingHours } = await supabase
        .from('dining_hall_hours')
        .select('*')
        .eq('dining_hall_id', diningHallId)
        .order('day_of_week', { ascending: true })

      setDiningHall(hall)
      setHours(operatingHours || [])
    } catch (error) {
      console.error('Error loading dining hall:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMenus() {
    if (!diningHallId) return
    setLoadingMenus(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')

    try {
      const { data } = await supabase
        .from('menu_schedules')
        .select(`
          id,
          date,
          meal_type,
          starts_at,
          ends_at,
          display_order,
          menu_items!inner (
            id,
            name,
            description,
            station_name,
            allergens,
            dietary_prefs,
            dining_hall_id
          )
        `)
        .eq('menu_items.dining_hall_id', diningHallId)
        .eq('date', dateStr)
        .order('meal_type', { ascending: true })
        .order('display_order', { ascending: true })

      setMenus(data || [])
    } catch (error) {
      console.error('Error loading menus:', error)
    } finally {
      setLoadingMenus(false)
    }
  }

  const goToPreviousDay = () => {
    setSelectedDate(addDays(selectedDate, -1))
  }

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleShare = async () => {
    if (!diningHall) return
    const shareUrl = `${window.location.origin}/${schoolSlug}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: diningHall.name,
          text: `Check out ${diningHall.name} dining hall`,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
        toast.error('Failed to copy link')
      }
    }
  }

  if (!diningHall && !loading) return null

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date().getDay()

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    late_night: 'Late Night',
  }

  // Group hours by day
  const hoursByDay = hours.reduce((acc, hour) => {
    if (!acc[hour.day_of_week]) {
      acc[hour.day_of_week] = []
    }
    acc[hour.day_of_week].push(hour)
    return acc
  }, {} as Record<number, OperatingHours[]>)

  // Get today's hours
  const todayHours = hoursByDay[today] || []

  // Check if open now
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
  const isOpenNow = todayHours.some(hour =>
    currentTime >= hour.opens_at && currentTime <= hour.closes_at
  )

  const content = (
    <div className="w-full h-full overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : diningHall ? (
        <>
          {/* Image */}
          <div className="w-full bg-background pt-4 pb-3 flex justify-center">
            <div className="relative w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/10 overflow-hidden rounded-xl">
              {diningHall.image_url ? (
                <Image
                  src={diningHall.image_url}
                  alt={diningHall.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}

              {/* Open/Closed Badge */}
              <div className="absolute top-3 left-3">
                {isOpenNow ? (
                  <Badge className="bg-green-500 text-white font-semibold gap-1.5 px-2.5 py-0.5 text-xs shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    OPEN NOW
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500 text-white font-semibold px-2.5 py-0.5 text-xs shadow-lg">
                    Closed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-4">
            {/* Title */}
            <h1 className="text-2xl font-bold">{diningHall.name}</h1>

            {/* Location & Hours - SIDE BY SIDE */}
            <div className="grid grid-cols-2 gap-3 py-3">
              {/* Location */}
              {(() => {
                const mapsUrl = getGoogleMapsUrl(
                  diningHall.latitude,
                  diningHall.longitude,
                  diningHall.name
                )
                const LocationContent = (
                  <>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1">Location</div>
                      {diningHall.address && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {diningHall.address}
                        </div>
                      )}
                    </div>
                    {mapsUrl && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  </>
                )

                return mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    {LocationContent}
                  </a>
                ) : (
                  <div className="flex items-center gap-2.5">
                    {LocationContent}
                  </div>
                )
              })()}

              {/* Today's Hours */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">Today</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {todayHours.length > 0 ? (
                      todayHours.map(h =>
                        `${h.opens_at.slice(0, 5)}-${h.closes_at.slice(0, 5)}`
                      ).join(', ')
                    ) : (
                      'Closed'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {diningHall.description && (
              <div className="space-y-3 pt-2 border-t">
                <h3 className="text-sm font-semibold">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {diningHall.description}
                </p>
              </div>
            )}

            {/* Menu Section with Date Navigation */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Menu</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousDay}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="h-8 px-3 text-xs"
                  >
                    {format(selectedDate, 'MMM d')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextDay}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {loadingMenus ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Loading menu...
                </div>
              ) : menus.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'late_night']
                    const menusByMeal = menus.reduce((acc, menu) => {
                      if (!acc[menu.meal_type]) {
                        acc[menu.meal_type] = []
                      }
                      acc[menu.meal_type].push(menu)
                      return acc
                    }, {} as Record<string, MenuSchedule[]>)

                    const sortedMealTypes = Object.keys(menusByMeal).sort(
                      (a, b) => mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b)
                    )

                    return sortedMealTypes.map((mealType) => {
                      const mealMenus = menusByMeal[mealType]
                      const itemsByStation = mealMenus.reduce((acc, menu) => {
                        const station = menu.menu_items[0]?.station_name || 'General'
                        if (!acc[station]) {
                          acc[station] = []
                        }
                        acc[station].push(menu)
                        return acc
                      }, {} as Record<string, MenuSchedule[]>)

                      return (
                        <div key={mealType} className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/50 px-3 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                {mealTypeLabels[mealType] || mealType}
                              </h4>
                              {mealMenus[0] && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(mealMenus[0].starts_at), 'h:mm a')} -{' '}
                                  {format(new Date(mealMenus[0].ends_at), 'h:mm a')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 space-y-3">
                            {Object.entries(itemsByStation).map(([station, items]) => (
                              <div key={station}>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                  {station}
                                </p>
                                <div className="space-y-2">
                                  {items.map((menu) => (
                                    <div key={menu.id} className="text-sm">
                                      <p className="font-medium">{menu.menu_items[0]?.name}</p>
                                      {menu.menu_items[0]?.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {menu.menu_items[0].description}
                                        </p>
                                      )}
                                      {(menu.menu_items[0]?.dietary_prefs || menu.menu_items[0]?.allergens) && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {menu.menu_items[0]?.dietary_prefs?.map((pref) => (
                                            <Badge
                                              key={pref}
                                              variant="secondary"
                                              className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            >
                                              {pref}
                                            </Badge>
                                          ))}
                                          {menu.menu_items[0]?.allergens?.map((allergen) => (
                                            <Badge
                                              key={allergen}
                                              variant="secondary"
                                              className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                            >
                                              {allergen}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No menu available for {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="w-full pt-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full font-medium w-full"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )

  // Mobile: Use Drawer (full screen modal)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[95vh] p-0">
          <DrawerTitle className="sr-only">{diningHall?.name || 'Dining Hall'}</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: Use Sheet (side panel)
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 overflow-y-auto"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
}
