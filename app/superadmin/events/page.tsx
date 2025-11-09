import { createAdminClient } from '@/utils/supabase/adminClient'
import { Calendar, MapPin, Building2 } from 'lucide-react'
import { formatTime, formatDate } from '@/lib/utils/transform'

// Revalidate every 30 seconds for fresh event data
export const revalidate = 30

export default async function EventsPage() {
  const supabase = createAdminClient()

  // Optimize query - only select fields we need
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      starts_at,
      venue_name,
      status,
      organizations!inner (name),
      schools!inner (name)
    `)
    .order('starts_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Events</h1>
        <p className="text-muted-foreground">
          {events?.length || 0} total events across all schools
        </p>
      </div>

      <div className="space-y-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : event.status === 'draft'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(event.starts_at)} at {formatTime(event.starts_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue_name}</span>
                    </div>

                    {event.organizations && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{Array.isArray(event.organizations) ? event.organizations[0]?.name : (event.organizations as { name: string }).name}</span>
                      </div>
                    )}

                    {event.schools && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {Array.isArray(event.schools) ? event.schools[0]?.name : (event.schools as { name: string }).name}
                        </span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-dashed rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-sm text-muted-foreground">
              Events will appear here once organizations start creating them
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
