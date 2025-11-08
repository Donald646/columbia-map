import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/data/auth'
import { createClient } from '@/utils/supabase/server'
import { CheckCircle2, XCircle, Building2, Shield, Crown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: { token?: string }
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const token = searchParams.token

  // If no token provided, redirect to home
  if (!token) {
    redirect('/')
  }

  const user = await getCurrentUser()

  // If not authenticated, redirect to login with next parameter
  if (!user) {
    const loginUrl = `/auth/login?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`
    redirect(loginUrl)
  }

  const supabase = await createClient()

  // Look up invitation by token
  const { data: invitation, error: invitationError } = await supabase
    .from('organization_invitations')
    .select(`
      *,
      organizations (id, name, description, logo_url)
    `)
    .eq('token', token)
    .single()

  // Handle invalid or expired token
  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or has expired. Please request a new invitation from your organization administrator.
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if invitation is expired
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Invitation Expired</h1>
            <p className="text-muted-foreground mb-6">
              This invitation expired on {new Date(invitation.expires_at).toLocaleDateString()}.
              Please request a new invitation from your organization administrator.
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if invitation was already accepted
  if (invitation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Invitation Already Used</h1>
            <p className="text-muted-foreground mb-6">
              This invitation has already been {invitation.status}.
            </p>
            <Link href="/admin">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if the invitation email matches the logged-in user
  // If not, we still allow it but with a warning (for flexibility)
  const emailMismatch = invitation.email.toLowerCase() !== user.email?.toLowerCase()

  // Auto-accept the invitation
  try {
    // Begin transaction-like operations

    // 1. Create organization_admin record
    const { error: adminError } = await supabase
      .from('organization_admins')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        email: user.email, // Use the actual user's email
        role: invitation.role,
        invited_by: invitation.invited_by,
        invitation_id: invitation.id,
      })

    if (adminError) {
      console.error('Error creating admin record:', adminError)
      throw adminError
    }

    // 2. Update invitation status
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      throw updateError
    }

    // Success! Redirect to admin dashboard
    redirect('/admin')

  } catch (error) {
    // If auto-accept fails, show manual acceptance UI
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  Join {invitation.organizations?.name}
                </h1>
                {invitation.organizations?.description && (
                  <p className="text-muted-foreground">
                    {invitation.organizations.description}
                  </p>
                )}
              </div>
            </div>

            {emailMismatch && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900 mb-1">Email Mismatch</p>
                    <p className="text-orange-800">
                      This invitation was sent to {invitation.email} but you're signed in as {user.email}.
                      You can still accept if this is intentional.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">You'll have access to:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {invitation.role === 'owner' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      Full organization control and settings
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Ability to invite and remove team members
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Create and manage events
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      View organization analytics
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                There was an issue automatically accepting your invitation.
                This might be because you're already a member or there was a temporary error.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/invitations" className="flex-1">
                <Button className="w-full">
                  View All Invitations
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}