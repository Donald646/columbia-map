import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { Plus, UtensilsCrossed, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DiningHallsPage() {
  const supabase = createAdminClient()

  // Fetch all dining halls with their schools and hours count
  const { data: diningHalls } = await supabase
    .from('dining_halls')
    .select(`
      *,
      schools (
        name,
        slug
      )
    `)
    .order('name', { ascending: true })

  // Get hours count for each dining hall
  const hallsWithHours = await Promise.all(
    (diningHalls || []).map(async (hall) => {
      const { count } = await supabase
        .from('dining_hall_hours')
        .select('*', { count: 'exact', head: true })
        .eq('dining_hall_id', hall.id)

      const { count: menuCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('dining_hall_id', hall.id)

      return { ...hall, hoursCount: count || 0, menuItemsCount: menuCount || 0 }
    })
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dining Halls</h1>
          <p className="text-muted-foreground">
            Manage dining hall locations, hours, and menus
          </p>
        </div>

        <Link href="/superadmin/dining-halls/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Dining Hall
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hallsWithHours && hallsWithHours.length > 0 ? (
          hallsWithHours.map((hall) => (
            <Link
              key={hall.id}
              href={`/superadmin/dining-halls/${hall.id}`}
              className="block group"
            >
              <div className="bg-card border rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-md h-full">
                {/* Header with image or icon */}
                <div className="relative h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                  {hall.image_url ? (
                    <img
                      src={hall.image_url}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-12 h-12 text-green-600" />
                  )}
                  {!hall.active && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-muted">
                        Inactive
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {hall.name}
                  </h3>

                  {hall.schools && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {hall.schools.name}
                    </p>
                  )}

                  {hall.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{hall.address}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{hall.hoursCount} hours</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>{hall.menuItemsCount} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-card border border-dashed rounded-lg p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No dining halls yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by adding your first dining hall
            </p>
            <Link href="/superadmin/dining-halls/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Dining Hall
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
