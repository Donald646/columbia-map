'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface EventActionsProps {
  eventId: string
  organizationId: string
  eventTitle: string
}

export function EventActions({ eventId, organizationId, eventTitle }: EventActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)

    try {
      const supabase = createClient()

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      toast.success('Event deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/superadmin/organizations/${organizationId}/events/${eventId}/edit`}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        Delete
      </Button>
    </div>
  )
}
