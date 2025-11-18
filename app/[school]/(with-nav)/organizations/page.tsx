import { getOrganizationsBySchool } from '@/lib/data/organizations'
import { getSchool } from '@/lib/data/events'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import OrganizationsSearch from '@/components/organizations-search'

export async function generateMetadata({
  params
}: {
  params: Promise<{ school: string }>
}): Promise<Metadata> {
  const { school: schoolSlug } = await params
  const school = await getSchool(schoolSlug)

  if (!school) {
    return {
      title: 'Organizations Not Found',
    }
  }

  const title = `Organizations at ${school.name} | EventsCU`
  const description = `Discover and explore student organizations at ${school.name}. Find clubs, societies, and student groups.`

  return {
    title,
    description,
    openGraph: {
      title: `Organizations at ${school.name}`,
      description,
      type: 'website',
      siteName: 'EventsCU',
    },
    twitter: {
      card: 'summary',
      title: `Organizations at ${school.name}`,
      description,
    },
  }
}

export default async function OrganizationsPage({
  params
}: {
  params: Promise<{ school: string }>
}) {
  const { school: schoolSlug } = await params

  // Get school and ALL organizations (no server-side filtering)
  const [school, organizations] = await Promise.all([
    getSchool(schoolSlug),
    getOrganizationsBySchool(schoolSlug)
  ])

  if (!school) {
    notFound()
  }

  return (
    <OrganizationsSearch
      organizations={organizations || []}
      schoolSlug={schoolSlug}
      schoolName={school.name}
    />
  )
}
