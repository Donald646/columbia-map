import { getOrganizationsBySchool } from '@/lib/data/organizations'
import { getSchool } from '@/lib/data/events'
import { notFound } from 'next/navigation'
import { BadgeCheck, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Metadata } from 'next'

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
  params,
  searchParams
}: {
  params: Promise<{ school: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { school: schoolSlug } = await params
  const { search } = await searchParams

  // Get school and organizations in parallel
  const [school, organizations] = await Promise.all([
    getSchool(schoolSlug),
    getOrganizationsBySchool(schoolSlug, { searchQuery: search })
  ])

  if (!school) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-3">Organizations</h1>
          <p className="text-muted-foreground mb-8">
            Discover student organizations at {school.name}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <form action="" method="get">
              <Input
                type="search"
                name="search"
                placeholder="Search organizations..."
                defaultValue={search}
                className="pl-10"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {organizations && organizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/${schoolSlug}/organizations/${org.slug}`}
                  className="block"
                >
                  <div className="border rounded-lg p-6 hover:border-primary transition-colors bg-card h-full">
                    <div className="flex items-start gap-4 mb-4">
                      {org.logo_url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                          <Image
                            src={org.logo_url}
                            alt={org.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {org.name}
                          </h3>
                          {org.verified && (
                            <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>

                        {org.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {org.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {org.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? 'Try adjusting your search'
                : 'No organizations available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
