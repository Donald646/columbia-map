import { createAdminClient } from '@/utils/supabase/adminClient'
import { redirect } from 'next/navigation'
import OrganizationDetailClient from './organization-detail-client'

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select(`
      *,
      schools!organizations_school_id_fkey (name, slug)
    `)
    .eq('id', id)
    .single()

  if (!org) {
    redirect('/superadmin/organizations')
  }

  // Get admins
  const { data: admins } = await supabase
    .from('organization_admins')
    .select(`
      id,
      organization_id,
      user_id,
      email,
      role,
      created_at,
      users (id, email)
    `)
    .eq('organization_id', id)

  // Get all users for adding new admins
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, email')
    .order('email')

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
    .eq('organization_id', id)
    .order('starts_at', { ascending: false })
    .limit(50)

  return (
    <OrganizationDetailClient
      org={org}
      admins={admins || []}
      allUsers={allUsers || []}
      events={events || []}
    />
  )
}
