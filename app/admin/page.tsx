import { redirect } from 'next/navigation'
import { getCurrentUser, getUserOrganizations } from '@/lib/data/auth'
import { createAdminClient } from '@/utils/supabase/adminClient'
import AdminDashboardClient from './admin-dashboard-client'

// Revalidate every 60 seconds for fresh stats
export const revalidate = 60

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  const organizations = await getUserOrganizations(user!.id)

  if (organizations.length === 0) {
    redirect('/auth/login')
  }

  const supabase = createAdminClient()
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

  // Get events for this organization
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      starts_at,
      ends_at,
      venue_name,
      venue_address,
      status,
      category,
      is_free,
      rsvp_count
    `)
    .eq('organization_id', currentOrg.id)
    .order('starts_at', { ascending: false })
    .limit(50)

  return (
    <AdminDashboardClient
      org={orgData || currentOrg}
      admins={admins || []}
      invitations={invitations || []}
      events={events || []}
      currentUserId={user!.id}
      currentUserRole={currentOrg.role}
    />
  )
}
