import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { EventForm } from '@/components/forms/event-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)
  const supabase = createAdminClient()

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) {
    redirect('/admin/events')
  }

  // Check if user has access to this event's organization
  const hasAccess = organizations.some(org => org.id === event.organization_id)
  if (!hasAccess) {
    redirect('/admin/events')
  }

  // Convert coordinates to strings for form
  const eventWithCoords = {
    ...event,
    latitude: event.latitude?.toString() || '',
    longitude: event.longitude?.toString() || '',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <EventForm organizations={organizations} event={eventWithCoords} />
    </div>
  )
}
