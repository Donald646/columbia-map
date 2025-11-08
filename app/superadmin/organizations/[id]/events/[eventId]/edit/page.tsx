import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { EventForm } from '@/components/forms/event-form'

export default async function EditEventPage({
  params
}: {
  params: { id: string; eventId: string }
}) {
  const supabase = createAdminClient()

  // Get the event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single()

  if (!event) {
    redirect(`/superadmin/organizations/${params.id}`)
  }

  // Get the organization with school info
  const { data: org } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      school_id,
      schools!organizations_school_id_fkey (
        id,
        slug
      )
    `)
    .eq('id', params.id)
    .single()

  if (!org) {
    redirect('/superadmin/organizations')
  }

  const schoolSlug = org.schools?.slug || 'columbia'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/superadmin/organizations/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to {org.name}
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
        <p className="text-muted-foreground">
          Update event details for {org.name}
        </p>
      </div>

      <EventForm
        organizationId={org.id}
        organizationName={org.name}
        schoolId={org.school_id}
        schoolSlug={schoolSlug}
        event={event}
        redirectUrl={`/superadmin/organizations/${params.id}`}
      />
    </div>
  )
}
