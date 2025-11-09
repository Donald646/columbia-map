import { getOrganizationBySlug } from '@/lib/data/organizations'
import { getSchool } from '@/lib/data/events'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, BadgeCheck, Globe, Instagram } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils/transform'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ school: string; slug: string }>
}): Promise<Metadata> {
  const { school: schoolSlug, slug } = await params

  const [orgData, school] = await Promise.all([
    getOrganizationBySlug(slug),
    getSchool(schoolSlug)
  ])

  if (!orgData || !school || orgData.school_id !== school.id) {
    return {
      title: 'Organization Not Found',
    }
  }

  const title = `${orgData.name} | ${school.name} | HapMap`
  const description = orgData.description || `View events and information for ${orgData.name} at ${school.name}.`

  return {
    title,
    description,
    openGraph: {
      title: orgData.name,
      description,
      type: 'website',
      siteName: 'HapMap',
      ...(orgData.logo_url && {
        images: [
          {
            url: orgData.logo_url,
            width: 1200,
            height: 630,
            alt: orgData.name,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary',
      title: orgData.name,
      description,
      ...(orgData.logo_url && {
        images: [orgData.logo_url],
      }),
    },
  }
}

export default async function OrganizationPage({
  params
}: {
  params: Promise<{ school: string; slug: string }>
}) {
  const { school: schoolSlug, slug } = await params

  // Get organization with events and school data in parallel
  const [orgData, school] = await Promise.all([
    getOrganizationBySlug(slug),
    getSchool(schoolSlug)
  ])

  if (!orgData || !school || orgData.school_id !== school.id) {
    notFound()
  }

  const { upcomingEvents, pastEvents, ...org } = orgData

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4">
        {/* Compact Banner */}
        <div className="relative mb-3">
          {/* Smaller Banner Image */}
          <div className="w-full h-[120px] md:h-[140px] overflow-hidden relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
            {org.banner_url ? (
              <Image
                src={org.banner_url}
                alt={`${org.name} banner`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl font-bold text-muted-foreground/10">
                  {org.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Smaller Logo */}
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-background bg-background shadow-md">
              {org.logo_url ? (
                <Image
                  src={org.logo_url}
                  alt={org.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold text-muted-foreground">
                    {org.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Organization Info */}
        <div className="pb-4 pt-10 space-y-3">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{org.name}</h1>
                {org.verified && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-2">
                {school.name}
              </p>

              {org.description && (
                <p className="text-sm text-foreground/70 mb-3 max-w-2xl">
                  {org.description}
                </p>
              )}

              {/* Social Links - Icon Row */}
              <div className="flex gap-2 items-center">
                {org.instagram_url && (
                  <a
                    href={org.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {org.website_url && (
                  <a
                    href={org.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Join Mailing List Button */}
            {org.mailing_list_url && (
              <Button asChild size="sm" className="flex-shrink-0 w-full md:w-auto">
                <a href={org.mailing_list_url} target="_blank" rel="noopener noreferrer">
                  Join Mailing List
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Events - Compact */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Upcoming Events */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Events</h2>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/${schoolSlug}/events/${event.id}`}
                  className="block"
                >
                  <div className="border rounded-lg hover:shadow-md hover:border-primary/50 transition-all bg-card p-3">
                    <div className="flex gap-3">
                      {/* Smaller Event Image */}
                      {event.image_url && (
                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}

                      {/* Compact Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {formatTime(event.starts_at)}
                          </p>
                          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                            {event.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {event.venue_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.venue_name}</span>
                            </div>
                          )}
                          <span className="text-muted-foreground/60">
                            {formatDate(event.starts_at).split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="font-semibold mb-1 text-sm">No upcoming events</h3>
              <p className="text-xs text-muted-foreground">
                Check back later for new events
              </p>
            </div>
          )}
        </section>

        {/* Past Events - Even More Compact */}
        {pastEvents && pastEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Past</h2>
            <div className="space-y-2">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-2.5 opacity-50 hover:opacity-75 transition-opacity"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatDate(event.starts_at).split(',')[0]} · {formatTime(event.starts_at)}
                        </span>
                        {event.venue_name && (
                          <>
                            <span>·</span>
                            <span className="truncate">{event.venue_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
