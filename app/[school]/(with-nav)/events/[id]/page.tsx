import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, ExternalLink, BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import { getGoogleMapsUrl } from '@/lib/utils/transform'
import { Metadata } from 'next'
import { EventShareButton } from '@/components/event-share-button'
import { RichTextViewer } from '@/components/ui/rich-text-viewer'
import { Button } from '@/components/ui/button'

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

  const title = `${event.title} | EventsCU`
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
      siteName: 'EventsCU',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
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
        website_url,
        logo_url,
        verified
      )
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Handle organizations being either an array or object from Supabase
  const organization = Array.isArray(event.organizations)
    ? event.organizations[0]
    : event.organizations

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

          {organization && (
            <a
              href={`/${schoolSlug}/organizations/${organization.slug}`}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {organization.logo_url ? (
                  <Image
                    src={organization.logo_url}
                    alt={organization.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    {organization.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">
                  Hosted by <span className="text-foreground font-medium">{organization.name}</span>
                </span>
                {organization.verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </a>
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

          <div className="space-y-3 text-center">
            <h3 className="text-sm font-semibold mb-1.5">Registration</h3>
            <p className="text-sm text-muted-foreground">
              Welcome! To join the event, please register below.
            </p>
          </div>

          <div className="w-full space-y-2">
            {event.external_url && (
              <Button
                variant="default"
                size="lg"
                className="rounded-full font-medium w-full"
                asChild
              >
                <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Event Details
                </a>
              </Button>
            )}
            <EventShareButton
              eventId={event.id}
              eventTitle={event.title}
              schoolSlug={schoolSlug}
              variant="outline"
              className="rounded-full font-medium w-full"
            />
          </div>

          {event.description && (
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold">About</h3>
              <RichTextViewer
                content={event.description}
                className="text-sm text-muted-foreground leading-relaxed"
              />
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
            {organization && (
              <div className="space-y-2.5">
                <div className="text-xs text-muted-foreground font-medium">Presented by</div>
                <a
                  href={`/${schoolSlug}/organizations/${organization.slug}`}
                  className="flex items-start gap-2.5 hover:opacity-70 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {organization.logo_url ? (
                      <Image
                        src={organization.logo_url}
                        alt={organization.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        {organization.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="font-semibold text-sm">{organization.name}</div>
                      {organization.verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </a>
                {organization.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {organization.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="space-y-5">
            {/* Title */}
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
            <div className="space-y-2.5 text-center">
              <h2 className="text-base font-semibold">Registration</h2>
              <p className="text-sm text-muted-foreground">
                Welcome! Please choose your desired ticket type:
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              {event.external_url && (
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full font-medium text-sm h-10 w-full"
                  asChild
                >
                  <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Event Details
                  </a>
                </Button>
              )}
              <EventShareButton
                eventId={event.id}
                eventTitle={event.title}
                schoolSlug={schoolSlug}
                variant="outline"
                className="rounded-full font-medium text-sm h-10 w-full"
              />
            </div>

            {/* About Event */}
            {event.description && (
              <div className="space-y-2.5 pt-4">
                <h2 className="text-base font-semibold">About Event</h2>
                <RichTextViewer
                  content={event.description}
                  className="text-sm text-muted-foreground leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
