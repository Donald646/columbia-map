import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { ArrowLeft, Edit, MapPin, Clock, UtensilsCrossed } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import DiningHallMenuView from './dining-hall-menu-view'

interface DiningHallHour {
  id: string
  dining_hall_id: string
  day_of_week: number
  meal_type: string
  opens_at: string
  closes_at: string
}

export default async function DiningHallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch dining hall details
  const { data: diningHall } = await supabase
    .from('dining_halls')
    .select(`
      *,
      schools (
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (!diningHall) {
    notFound()
  }

  // Fetch operating hours
  const { data: hours } = await supabase
    .from('dining_hall_hours')
    .select('*')
    .eq('dining_hall_id', id)
    .order('day_of_week', { ascending: true })
    .order('meal_type', { ascending: true })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    late_night: 'Late Night',
  }

  // Group hours by day
  const hoursByDay = hours?.reduce((acc, hour) => {
    if (!acc[hour.day_of_week]) {
      acc[hour.day_of_week] = []
    }
    acc[hour.day_of_week].push(hour)
    return acc
  }, {} as Record<number, DiningHallHour[]>)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/superadmin/dining-halls">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dining Halls
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{diningHall.name}</h1>
              {!diningHall.active && (
                <Badge variant="secondary" className="bg-muted">
                  Inactive
                </Badge>
              )}
            </div>
            {diningHall.schools && (
              <p className="text-muted-foreground text-lg">
                {diningHall.schools.name}
              </p>
            )}
          </div>

          <Link href={`/superadmin/dining-halls/${id}/edit`}>
            <Button className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="font-semibold text-lg mb-4">Details</h2>

            {diningHall.address && (
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {diningHall.address}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Coordinates</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {diningHall.latitude.toFixed(6)}, {diningHall.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            {diningHall.description && (
              <div className="flex items-start gap-3">
                <UtensilsCrossed className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {diningHall.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours Card */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Operating Hours</h2>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>

            {hoursByDay && Object.keys(hoursByDay).length > 0 ? (
              <div className="space-y-4">
                {(Object.entries(hoursByDay) as [string, DiningHallHour[]][]).map(([day, dayHours]) => (
                  <div key={day} className="pb-4 border-b last:border-b-0 last:pb-0">
                    <p className="font-medium text-sm mb-2">
                      {dayNames[parseInt(day)]}
                    </p>
                    <div className="space-y-1">
                      {dayHours.map((hour) => (
                        <div
                          key={hour.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {mealTypeLabels[hour.meal_type]}
                          </span>
                          <span className="font-mono">
                            {hour.opens_at.slice(0, 5)} - {hour.closes_at.slice(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No operating hours set
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Menu View */}
        <div className="lg:col-span-2">
          <DiningHallMenuView diningHallId={id} />
        </div>
      </div>
    </div>
  )
}
