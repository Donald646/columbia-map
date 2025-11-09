import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { EventForm } from '@/components/forms/event-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/utils/supabase/adminClient'

export default async function NewEventPage() {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)

  if (organizations.length === 0) {
    redirect('/admin')
  }

  // Use first organization (TODO: add organization selector if user has multiple)
  const organization = organizations[0]
  const supabase = createAdminClient()

  // Get school info
  const { data: school } = await supabase
    .from('schools')
    .select('id, slug')
    .eq('id', organization.school_id)
    .single()

  if (!school) {
    redirect('/admin')
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

        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground">
          Add a new event for {organization.name}
        </p>
      </div>

      <EventForm
        organizationId={organization.id}
        organizationName={organization.name}
        schoolId={school.id}
        schoolSlug={school.slug}
        redirectUrl="/admin/events"
      />
    </div>
  )
}
