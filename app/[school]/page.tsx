import { getEvents } from '@/lib/data/events'
import { eventToMarker } from '@/lib/utils/transform'
import { getSchoolBySlug } from '@/lib/schools/config'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SchoolMapClient from './school-map-client'

// Revalidate every 5 minutes for fresh event data
export const revalidate = 300

export default async function SchoolMapPage({
  params,
  searchParams
}: {
  params: { school: string }
  searchParams: { category?: string; time?: string; price?: string }
}) {
  const schoolConfig = getSchoolBySlug(params.school)
  if (!schoolConfig) {
    notFound()
  }

  // Parallelize all data fetching for performance
  const supabase = await createClient()

  // Start all queries in parallel
  const [
    { data: { user } },
    events,
    { data: schoolData }
  ] = await Promise.all([
    supabase.auth.getUser(),
    getEvents(params.school, {
      category: searchParams.category,
      timeRange: searchParams.time,
      isFree: searchParams.price === 'free' ? true : undefined
    }),
    supabase
      .from('schools')
      .select('name, horizontal_logo_url')
      .eq('slug', params.school)
      .single()
  ])

  // Now fetch user data if logged in (parallel)
  let userRole = null
  let isOrgAdmin = false

  if (user) {
    const [userData, orgAdmin] = await Promise.all([
      supabase
        .from('users')
        .select('role, is_super_admin')
        .eq('id', user.id)
        .single(),
      supabase
        .from('organization_admins')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
    ])

    userRole = userData.data?.role || null
    isOrgAdmin = !!orgAdmin.data
  }

  // Convert to markers
  const markers = events.map(eventToMarker)

  return (
    <SchoolMapClient
      events={events}
      markers={markers}
      schoolSlug={params.school}
      schoolName={schoolData?.name || schoolConfig.name}
      schoolHorizontalLogo={schoolData?.horizontal_logo_url || null}
      campusCenter={schoolConfig.mapCenter}
      initialZoom={schoolConfig.mapZoom}
      initialBearing={schoolConfig.mapBearing}
      userRole={userRole}
      isOrgAdmin={isOrgAdmin}
    />
  )
}
