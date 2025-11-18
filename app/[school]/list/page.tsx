import { getEvents } from '@/lib/data/events'
import { getSchoolBySlug } from '@/lib/schools/config'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import ListViewClient from './list-view-client'

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

  return {
    title: `${schoolName} Events - List View | EventsCU`,
    description: `Browse all events at ${schoolName} in a list format.`,
  }
}

export default async function ListViewPage({
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

  const supabase = await createClient()

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
      .select('id, name, horizontal_logo_url')
      .eq('slug', school)
      .single()
  ])

  let userRole = null
  let isOrgAdmin = false
  let avatarUrl = null
  let organizationName = null

  if (user) {
    const [userData, orgAdmin] = await Promise.all([
      supabase
        .from('users')
        .select('role, avatar_url')
        .eq('id', user.id)
        .single(),
      supabase
        .from('organization_admins')
        .select('organization_id, organizations(name)')
        .eq('user_id', user.id)
        .limit(1)
        .single()
    ])

    userRole = userData.data?.role || null
    avatarUrl = userData.data?.avatar_url || null
    isOrgAdmin = !!orgAdmin.data
    // Supabase returns organizations as an object for many-to-one relationships
    const orgs = orgAdmin.data?.organizations
    if (orgs && typeof orgs === 'object' && 'name' in orgs) {
      organizationName = (orgs.name as string) || null
    } else {
      organizationName = null
    }
  }

  return (
    <ListViewClient
      events={events}
      schoolSlug={school}
      schoolName={schoolData?.name || schoolConfig.name}
      schoolHorizontalLogo={schoolData?.horizontal_logo_url || null}
      userRole={userRole}
      isOrgAdmin={isOrgAdmin}
      avatarUrl={avatarUrl}
      organizationName={organizationName}
    />
  )
}
