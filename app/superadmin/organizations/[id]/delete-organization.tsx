'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface DeleteOrganizationProps {
  organizationId: string
  organizationName: string
}

export function DeleteOrganization({ organizationId, organizationName }: DeleteOrganizationProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${organizationName}"?\n\n` +
      `This will:\n` +
      `- Delete all events created by this organization\n` +
      `- Delete all uploaded images\n` +
      `- Remove all organization admins\n\n` +
      `This action CANNOT be undone!`
    )

    if (!confirmed) return

    // Double confirmation for safety
    const doubleConfirm = confirm(
      `FINAL WARNING: This will permanently delete "${organizationName}" and all its data.\n\n` +
      `Type the organization name to confirm deletion.`
    )

    if (!doubleConfirm) return

    setDeleting(true)

    try {
      const supabase = createClient()

      // Delete all files in organization folders from both buckets
      // Format: {organizationId}/*
      const { data: eventImagesList } = await supabase.storage
        .from('event-images')
        .list(organizationId)

      if (eventImagesList && eventImagesList.length > 0) {
        const eventImagePaths = eventImagesList.map(file => `${organizationId}/${file.name}`)
        await supabase.storage.from('event-images').remove(eventImagePaths)
      }

      const { data: orgLogosList } = await supabase.storage
        .from('organization-logos')
        .list(organizationId)

      if (orgLogosList && orgLogosList.length > 0) {
        const orgLogoPaths = orgLogosList.map(file => `${organizationId}/${file.name}`)
        await supabase.storage.from('organization-logos').remove(orgLogoPaths)
      }

      // Delete the organization (cascades to events, admins, etc.)
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId)

      if (error) throw error

      toast.success('Organization deleted successfully')
      router.push('/superadmin/organizations')
      router.refresh()
    } catch (error) {
      console.error('Error deleting organization:', error)
      toast.error(`Failed to delete organization: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDeleting(false)
    }
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
      <p className="text-sm text-red-700 mb-4">
        Deleting this organization will permanently remove all events, images, and related data. This action cannot be undone.
      </p>
      <Button
        variant="destructive"
        className="gap-2"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deleting Organization...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete Organization
          </>
        )}
      </Button>
    </div>
  )
}
