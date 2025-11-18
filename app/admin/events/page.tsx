import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, MapPin, Eye, Building2 } from 'lucide-react'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { formatTime, formatDate } from '@/lib/utils/transform'
import { RichTextViewer } from '@/components/ui/rich-text-viewer'

export default async function EventsPage() {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)
  const supabase = createAdminClient()

  const orgIds = organizations.map(o => o.id)

  // Fetch all events for user's organizations
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organizations (name, logo_url)
    `)
    .in('organization_id', orgIds)
    .order('starts_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">
            {events?.length || 0} total events
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/admin/events/new">
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}/edit`}
              className="block"
            >
              <div className="bg-card border rounded-lg p-6 hover:border-primary transition-colors">
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
                          <span>{event.organizations.name}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        <RichTextViewer content={event.description} className="text-sm" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {event.status === 'published' && event.slug && (
                      <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link
                          href={`/${event.school_id}/events/${event.slug}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-card border border-dashed rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating your first event
            </p>
            <Button asChild className="gap-2">
              <Link href="/admin/events/new">
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
