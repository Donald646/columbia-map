import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { EventForm } from '@/components/forms/event-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewEventPage() {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)

  if (organizations.length === 0) {
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
          Add a new event for your organization
        </p>
      </div>

      <EventForm organizations={organizations} />
    </div>
  )
}
