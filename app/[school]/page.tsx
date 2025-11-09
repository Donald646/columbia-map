import { getEvents } from '@/lib/data/events'
import { eventToMarker } from '@/lib/utils/transform'
import { getSchoolBySlug } from '@/lib/schools/config'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SchoolMapClient from './school-map-client'
import { Metadata } from 'next'

// Revalidate every 5 minutes for fresh event data
export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school: string }>
}): Promise<Metadata> {
  const { school } = await params
  const schoolConfig = getSchoolBySlug(school)

  if (!schoolConfig) {
    return {
      title: 'School Not Found',
    }
  }

  const supabase = await createClient()
  const { data: schoolData } = await supabase
    .from('schools')
    .select('name, description')
    .eq('slug', school)
    .single()

  const schoolName = schoolData?.name || schoolConfig.name
  const description = schoolData?.description || `Discover events happening at ${schoolName}. Find parties, club meetings, sports events, and more.`

  return {
    title: `${schoolName} Events | EventsCU`,
    description,
    openGraph: {
      title: `${schoolName} Events`,
      description,
      type: 'website',
      siteName: 'EventsCU',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${schoolName} Events`,
      description,
    },
  }
}

export default async function SchoolMapPage({
  params,
  searchParams
}: {
  params: Promise<{ school: string }>
  searchParams: Promise<{ category?: string; time?: string; price?: string }>
}) {
  const { school } = await params
  const { category, time, price } = await searchParams

  const schoolConfig = getSchoolBySlug(school)
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
    getEvents(school, {
      category: category,
      timeRange: time,
      isFree: price === 'free' ? true : undefined
    }),
    supabase
      .from('schools')
      .select('name, horizontal_logo_url')
      .eq('slug', school)
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
      schoolSlug={school}
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
