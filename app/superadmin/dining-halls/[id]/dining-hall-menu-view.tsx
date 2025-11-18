'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'

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

interface DiningHallMenuViewProps {
  diningHallId: string
}

export default function DiningHallMenuView({ diningHallId }: DiningHallMenuViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [menus, setMenus] = useState<MenuSchedule[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadMenus()
  }, [selectedDate, diningHallId])

  async function loadMenus() {
    setLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')

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
    setLoading(false)
  }

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    late_night: 'Late Night',
  }

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'late_night']

  // Group menus by meal type
  const menusByMeal = menus.reduce((acc, menu) => {
    if (!acc[menu.meal_type]) {
      acc[menu.meal_type] = []
    }
    acc[menu.meal_type].push(menu)
    return acc
  }, {} as Record<string, MenuSchedule[]>)

  // Sort by meal type order
  const sortedMealTypes = Object.keys(menusByMeal).sort(
    (a, b) => mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b)
  )

  const goToPreviousDay = () => {
    setSelectedDate(addDays(selectedDate, -1))
  }

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="bg-card border rounded-lg">
      {/* Date Navigation */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg mb-1">Menu Schedule</h2>
            <p className="text-sm text-muted-foreground">
              View and manage daily menus
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousDay}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant={isToday ? 'secondary' : 'outline'}
              size="sm"
              onClick={goToToday}
              className="gap-2 min-w-[140px]"
            >
              <Calendar className="w-4 h-4" />
              {format(selectedDate, 'MMM d, yyyy')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextDay}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading menu...
          </div>
        ) : sortedMealTypes.length > 0 ? (
          <div className="space-y-6">
            {sortedMealTypes.map((mealType) => {
              const mealMenus = menusByMeal[mealType]

              // Group by station
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
                  {/* Meal Type Header */}
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {mealTypeLabels[mealType] || mealType}
                      </h3>
                      {mealMenus[0] && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(mealMenus[0].starts_at), 'h:mm a')} -{' '}
                          {format(new Date(mealMenus[0].ends_at), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items by Station */}
                  <div className="p-4 space-y-4">
                    {Object.entries(itemsByStation).map(([station, items]) => (
                      <div key={station}>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          {station}
                        </h4>
                        <div className="space-y-2">
                          {items.map((menu) => (
                            <div
                              key={menu.id}
                              className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium mb-1">
                                  {menu.menu_items[0]?.name}
                                </p>
                                {menu.menu_items[0]?.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {menu.menu_items[0].description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  {menu.menu_items[0]?.dietary_prefs?.map((pref) => (
                                    <Badge
                                      key={pref}
                                      variant="secondary"
                                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    >
                                      {pref}
                                    </Badge>
                                  ))}
                                  {menu.menu_items[0]?.allergens?.map((allergen) => (
                                    <Badge
                                      key={allergen}
                                      variant="secondary"
                                      className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    >
                                      {allergen}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No menu for this day</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No menu items have been added for {format(selectedDate, 'MMMM d, yyyy')}
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Menu Items
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
