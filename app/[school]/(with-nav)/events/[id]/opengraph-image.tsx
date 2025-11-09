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
  const dateString = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeString = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Background - Event Image or Gradient */}
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
            }}
          />
        )}

        {/* Dark overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
          }}
        />

        {/* EventsCU Badge - Top Right */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          EventsCU
        </div>

        {/* Date Badge - Top Left */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ef4444', display: 'flex' }}>
            {dateMonth}
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#1f2937', lineHeight: 1, display: 'flex' }}>
            {dateDay}
          </div>
        </div>

        {/* Content Overlay - Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            padding: '48px 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Event Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              display: 'flex',
              maxWidth: '100%',
            }}
          >
            {event.title.length > 60 ? event.title.substring(0, 60) + '...' : event.title}
          </div>

          {/* Event Details Row */}
          <div
            style={{
              display: 'flex',
              gap: '32px',
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
            }}
          >
            {/* Date & Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span>
              <span>{dateString} · {timeString}</span>
            </div>

            {/* Venue */}
            {event.venue_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span>{event.venue_name.length > 30 ? event.venue_name.substring(0, 30) + '...' : event.venue_name}</span>
              </div>
            )}
          </div>

          {/* Hosted By */}
          {organizationName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <span>Hosted by</span>
              <span style={{ fontWeight: 'bold', color: 'white', display: 'flex' }}>
                {organizationName}
              </span>
              {isVerified && (
                <span style={{ color: '#3b82f6', display: 'flex' }}>✓</span>
              )}
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
