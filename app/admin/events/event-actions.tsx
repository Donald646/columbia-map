'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EventActionsProps {
  eventId: string
  eventTitle: string
}

export function EventActions({ eventId, eventTitle }: EventActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
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
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/events/${eventId}/edit`} className="flex items-center gap-2 cursor-pointer">
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {deleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
