import { ImageResponse } from 'next/og'
import { createClient } from '@/utils/supabase/server'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Event on EventsCU'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: Promise<{ school: string; id: string }> }) {
  const { id } = await params

  // Fetch event data
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
        name,
        verified
      )
    `)
    .eq('id', id)
    .single()

  // Check if image is supported format (not AVIF or WEBP)
  const isImageSupported = event?.image_url &&
    !event.image_url.toLowerCase().includes('.avif') &&
    !event.image_url.toLowerCase().includes('.webp')

  if (!event) {
    // Fallback for invalid event
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          EventsCU
        </div>
      ),
      {
        ...size,
      }
    )
  }

  const organizationName = Array.isArray(event.organizations)
    ? event.organizations[0]?.name
    : (event.organizations as { name: string; verified: boolean } | null)?.name

  const isVerified = Array.isArray(event.organizations)
    ? event.organizations[0]?.verified
    : (event.organizations as { name: string; verified: boolean } | null)?.verified

  // Format date
  const eventDate = event.starts_at ? new Date(event.starts_at) : new Date()
  const dateMonth = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const dateDay = eventDate.getDate().toString()
  const dateWeekday = eventDate.toLocaleString('en-US', { weekday: 'long' })
  const timeString = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#18181b',
        }}
      >
        {/* Left Side - Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
          }}
        >
          {/* Top - Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: 'bold',
                display: 'flex',
              }}
            >
              EventsCU
            </div>
          </div>

          {/* Bottom - Event Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Event Title */}
            <div
              style={{
                fontSize: 52,
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                display: 'flex',
              }}
            >
              {event.title.length > 40 ? event.title.substring(0, 40) + '...' : event.title}
            </div>

            {/* Event Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Date & Time */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: 22,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    minWidth: '70px',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ef4444', display: 'flex' }}>
                    {dateMonth}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: 'white', lineHeight: 1, display: 'flex' }}>
                    {dateDay}
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {dateWeekday}, {timeString}
                </div>
              </div>

              {/* Venue */}
              {event.venue_name && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <span style={{ display: 'flex' }}>📍</span>
                  <span style={{ display: 'flex' }}>
                    {event.venue_name.length > 35 ? event.venue_name.substring(0, 35) + '...' : event.venue_name}
                  </span>
                </div>
              )}

              {/* Hosted By */}
              {organizationName && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <span style={{ display: 'flex' }}>Hosted by</span>
                  <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)', display: 'flex' }}>
                    {organizationName}
                  </span>
                  {isVerified && (
                    <span style={{ color: '#3b82f6', display: 'flex' }}>✓</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div
          style={{
            width: '480px',
            display: 'flex',
            position: 'relative',
          }}
        >
          {isImageSupported ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image_url!}
              alt={event.title}
              width="480"
              height="630"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 80, display: 'flex' }}>📅</div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
