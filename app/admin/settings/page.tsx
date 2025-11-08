import { redirect } from 'next/navigation'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { createAdminClient } from '@/utils/supabase/adminClient'
import SettingsContent from './settings-content'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)

  if (organizations.length === 0) {
    redirect('/admin')
  }

  const supabase = createAdminClient()

  // Get the first organization (can add org selector later)
  const currentOrg = organizations[0]

  // Fetch complete organization data
  const { data: orgData } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', currentOrg.id)
    .single()

  // Get all admins for this organization
  const { data: admins } = await supabase
    .from('organization_admins')
    .select(`
      *,
      users (id, email)
    `)
    .eq('organization_id', currentOrg.id)
    .order('created_at', { ascending: true })

  // Get pending invitations
  const { data: invitations } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Get schools for organization form
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('name')

  return (
    <SettingsContent
      organization={orgData || currentOrg}
      currentUserId={user!.id}
      currentUserRole={currentOrg.role}
      admins={admins || []}
      invitations={invitations || []}
      schools={schools || []}
    />
  )
}
