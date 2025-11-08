import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/data/auth'
import { createClient } from '@/utils/supabase/server'
import InvitationsList from './invitations-list'

export default async function InvitationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Get pending invitations for this user's email
  const { data: invitations } = await supabase
    .from('organization_invitations')
    .select(`
      *,
      organizations (id, name, description)
    `)
    .eq('email', user.email)
    .eq('status', 'pending')

  if (!invitations || invitations.length === 0) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Organization Invitations</h1>
          <p className="text-muted-foreground">
            You have {invitations.length} pending {invitations.length === 1 ? 'invitation' : 'invitations'}
          </p>
        </div>

        <InvitationsList invitations={invitations} userId={user.id} />
      </div>
    </div>
  )
}
