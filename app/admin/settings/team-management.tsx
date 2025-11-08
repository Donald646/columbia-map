'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Trash2, Mail, Clock, CheckCircle2, XCircle, Crown, Shield, Link2, Copy } from 'lucide-react'

interface TeamManagementProps {
  organizationId: string
  currentUserId: string
  currentUserRole: string
  admins: any[]
  invitations: any[]
}

export default function TeamManagement({
  organizationId,
  currentUserId,
  currentUserRole,
  admins: initialAdmins,
  invitations: initialInvitations,
}: TeamManagementProps) {
  const router = useRouter()
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'owner'>('admin')
  const [loading, setLoading] = useState(false)
  const [showInviteSuccess, setShowInviteSuccess] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const isOwner = currentUserRole === 'owner'

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
      alert('Invitation link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail.toLowerCase())
        .single()

      if (existingUser) {
        // Check if already an admin
        const { data: existingAdmin } = await supabase
          .from('organization_admins')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('user_id', existingUser.id)
          .single()

        if (existingAdmin) {
          alert('This user is already an admin')
          setLoading(false)
          return
        }

        // Add directly as admin
        const { error } = await supabase
          .from('organization_admins')
          .insert({
            organization_id: organizationId,
            user_id: existingUser.id,
            role: inviteRole,
            invited_by: currentUserId,
          })

        if (error) throw error

        // Show immediate feedback for existing users
        setInviteEmail('')
        setShowInviteForm(false)
        router.refresh()
      } else {
        // Create invitation and get the token
        const { data: invitation, error } = await supabase
          .from('organization_invitations')
          .insert({
            organization_id: organizationId,
            email: inviteEmail.toLowerCase(),
            role: inviteRole,
            invited_by: currentUserId,
            status: 'pending',
          })
          .select('token')
          .single()

        if (error) throw error

        // Generate the invitation link
        const invitationUrl = `${window.location.origin}/invitations/accept?token=${invitation.token}`
        setInviteLink(invitationUrl)
        setShowInviteSuccess(true)

        // Reset form but keep success message visible
        setInviteEmail('')
        setShowInviteForm(false)

        // Refresh to show new invitation in pending list
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error inviting user:', error)
      alert(`Failed to invite user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} from this organization?`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organization_admins')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error removing admin:', error)
      alert(`Failed to remove admin: ${error.message}`)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error cancelling invitation:', error)
      alert(`Failed to cancel invitation: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Team Members</h2>
          {isOwner && (
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="gap-2"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <form onSubmit={handleInvite} className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-4">Invite New Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Can be any email address (doesn't need to be .edu for admins)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'owner')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="admin">Admin - Can manage events</option>
                  <option value="owner">Owner - Full access including team management</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Create Invitation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false)
                    setInviteEmail('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Invitation Success Message */}
        {showInviteSuccess && inviteLink && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 mb-1">Invitation Created Successfully!</p>
                <p className="text-sm text-green-800">
                  Share this link with the invited person. They can use it to sign up or sign in and automatically become an admin.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white border rounded-md">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 text-sm bg-transparent outline-none"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(inviteLink)}
                className="gap-2"
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowInviteSuccess(false)
                  setInviteLink('')
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-2">
          {initialAdmins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {admin.users?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{admin.users?.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {admin.role === 'owner' ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Owner
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isOwner && admin.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAdmin(admin.id, admin.users?.email)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          {initialAdmins.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No team members yet</p>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {initialInvitations.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Pending Invitations</h2>
          <div className="space-y-2">
            {initialInvitations.map((invitation) => {
              const invitationUrl = `${window.location.origin}/invitations/accept?token=${invitation.token}`
              return (
                <div
                  key={invitation.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Invited {new Date(invitation.created_at).toLocaleDateString()}</span>
                          <span className="text-xs">•</span>
                          <span className="capitalize">{invitation.role}</span>
                          {invitation.expires_at && (
                            <>
                              <span className="text-xs">•</span>
                              <span>Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(invitationUrl)}
                          className="gap-1"
                        >
                          <Link2 className="w-3 h-3" />
                          Copy Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Show invitation link for easy resharing */}
                  {isOwner && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{invitationUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
