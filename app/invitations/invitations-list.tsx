'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle2, XCircle, Building2, Shield, Crown } from 'lucide-react'

interface InvitationsListProps {
  invitations: any[]
  userId: string
}

export default function InvitationsList({ invitations, userId }: InvitationsListProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAccept = async (invitation: any) => {
    setProcessing(invitation.id)

    try {
      const supabase = createClient()

      // Create organization_admin record
      const { error: adminError } = await supabase
        .from('organization_admins')
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role,
          invited_by: invitation.invited_by,
        })

      if (adminError) throw adminError

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('organization_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      if (inviteError) throw inviteError

      // Redirect to admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      console.error('Error accepting invitation:', error)
      alert(`Failed to accept invitation: ${error.message}`)
      setProcessing(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    setProcessing(invitationId)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error declining invitation:', error)
      alert(`Failed to decline invitation: ${error.message}`)
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div key={invitation.id} className="bg-card border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                {invitation.organizations?.name}
              </h3>

              {invitation.organizations?.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {invitation.organizations.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm mb-4">
                {invitation.role === 'owner' ? (
                  <span className="flex items-center gap-1 text-primary">
                    <Crown className="w-4 h-4" />
                    Owner Access
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Admin Access
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleAccept(invitation)}
                  disabled={processing === invitation.id}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {processing === invitation.id ? 'Accepting...' : 'Accept Invitation'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={processing === invitation.id}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
