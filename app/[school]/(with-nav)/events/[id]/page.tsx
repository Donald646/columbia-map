import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getGoogleMapsUrl } from '@/lib/utils/transform'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school: string; id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`
      title,
      description,
      image_url,
      starts_at,
      venue_name,
      organizations (
        name
      )
    `)
    .eq('id', id)
    .single()

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  const organizationName = Array.isArray(event.organizations)
    ? event.organizations[0]?.name
    : (event.organizations as { name: string } | null)?.name

  const title = `${event.title} | HapMap`
  const description = event.description || `Join us for ${event.title}${organizationName ? ` hosted by ${organizationName}` : ''}.`
  const eventDate = event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : ''

  return {
    title,
    description: `${eventDate ? eventDate + ' - ' : ''}${description}`,
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      siteName: 'HapMap',
      ...(event.image_url && {
        images: [
          {
            url: event.image_url,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      ...(event.image_url && {
        images: [event.image_url],
      }),
    },
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ school: string; id: string }>
}) {
  const { school: schoolSlug, id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      organizations (
        name,
        slug,
        description,
        website_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Layout - Single Column Centered */}
        <div className="lg:hidden space-y-6 max-w-xl mx-auto">
          {/* Event Image - Small centered square */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight">{event.title}</h1>

          {event.organizations && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {event.organizations.name.charAt(0)}
              </div>
              <span className="text-sm text-muted-foreground">
                Hosted by <span className="text-foreground font-medium">{event.organizations.name}</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <div className="flex flex-col items-center justify-center bg-background rounded-lg w-11 h-11 flex-shrink-0">
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">OCT</div>
                <div className="text-lg font-bold leading-none">22</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Wednesday, October 22</div>
                <div className="text-xs text-muted-foreground">
                  {event.starts_at ? new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '5:30 PM'} - {event.ends_at ? new Date(event.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '7:30 PM'}
                </div>
              </div>
            </div>

            {(() => {
              const mapsUrl = getGoogleMapsUrl(event.latitude, event.longitude, event.venue_name)
              const LocationContent = (
                <>
                  <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-clamp-1">{event.venue_name || 'TBA'}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {event.venue_address ? event.venue_address.split(',').slice(-2).join(',') : 'New York, NY'}
                    </div>
                  </div>
                  {mapsUrl && <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </>
              )

              return mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  {LocationContent}
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  {LocationContent}
                </div>
              )
            })()}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-1.5">Registration</h3>
            <p className="text-sm text-muted-foreground">
              Welcome! To join the event, please register below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="rounded-full font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              Add to calendar
            </Button>
            <Button variant="outline" size="lg" className="rounded-full font-medium">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {event.description && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {event.organizations && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold">Hosted By</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {event.organizations.name.charAt(0)}
                </div>
                <div className="font-semibold text-sm">{event.organizations.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout - Two Columns like Luma */}
        <div className="hidden lg:grid lg:grid-cols-[260px_1fr] gap-6 max-w-5xl mx-auto">
          {/* Left Sidebar */}
          <div className="space-y-5">
            {/* Event Image - Smaller Square */}
            <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={260}
                  height={260}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Presented by */}
            {event.organizations && (
              <div className="space-y-2.5">
                <div className="text-xs text-muted-foreground font-medium">Presented by</div>
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                    {event.organizations.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{event.organizations.name}</div>
                    <Button variant="outline" size="sm" className="mt-1.5 h-7 text-xs">
                      Subscribe
                    </Button>
                  </div>
                </div>
                {event.organizations.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {event.organizations.description}
                  </p>
                )}
              </div>
            )}

            {/* Hosted By */}
            {event.organizations && (
              <div className="space-y-2.5 pt-3">
                <div className="text-xs font-semibold">Hosted By</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {event.organizations.name.charAt(0)}
                  </div>
                  <div className="font-medium text-sm">{event.organizations.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content with gradient background */}
          <div className="space-y-5 bg-gradient-to-br from-green-50/50 via-yellow-50/30 to-green-50/50 dark:from-green-950/20 dark:via-yellow-950/10 dark:to-green-950/20 rounded-2xl p-8">
            {/* Featured Badge */}
            <div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs">
                Featured in {schoolSlug.charAt(0).toUpperCase() + schoolSlug.slice(1)}
              </Badge>
            </div>

            {/* Title - Smaller */}
            <h1 className="text-3xl font-bold leading-tight">{event.title}</h1>

            {/* Date & Location - Simpler, no card backgrounds */}
            <div className="grid grid-cols-2 gap-6">
              {/* Date */}
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col items-center justify-center bg-background rounded-lg w-11 h-11 flex-shrink-0 shadow-sm">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase">OCT</div>
                  <div className="text-xl font-bold leading-none">22</div>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="font-semibold text-sm">Wednesday, October 22</div>
                  <div className="text-xs text-muted-foreground">
                    {event.starts_at ? new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '5:30 PM'} - {event.ends_at ? new Date(event.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '7:30 PM'} EDT
                  </div>
                </div>
              </div>

              {/* Location */}
              {(() => {
                const mapsUrl = getGoogleMapsUrl(event.latitude, event.longitude, event.venue_name)
                const LocationContent = (
                  <>
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{event.venue_name || 'Register to See Address'}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.venue_address ? event.venue_address.split(',').slice(-2).join(',') : 'New York, New York'}
                      </div>
                    </div>
                    {mapsUrl && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  </>
                )

                return mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    {LocationContent}
                  </a>
                ) : (
                  <div className="flex items-start gap-2.5">
                    {LocationContent}
                  </div>
                )
              })()}
            </div>

            {/* Registration */}
            <div className="space-y-2.5">
              <h2 className="text-base font-semibold">Registration</h2>
              <p className="text-sm text-muted-foreground">
                Welcome! Please choose your desired ticket type:
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button size="default" className="rounded-full font-medium text-sm h-10">
                <Calendar className="w-4 h-4 mr-2" />
                Add to calendar
              </Button>
              <Button variant="outline" size="default" className="rounded-full font-medium text-sm h-10">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* About Event */}
            {event.description && (
              <div className="space-y-2.5 pt-4">
                <h2 className="text-base font-semibold">About Event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
