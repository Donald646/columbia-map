import { ImageResponse } from 'next/og'
import { getSchool } from '@/lib/data/events'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'EventsCU - Campus Events'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: Promise<{ school: string }> }) {
  const { school: schoolSlug } = await params

  // Fetch school data
  const school = await getSchool(schoolSlug)

  if (!school) {
    // Fallback for invalid school
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

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
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

        {/* School Logo */}
        {school.logo_url && (
          <div style={{ display: 'flex', marginBottom: '40px' }}>
            <img
              src={school.logo_url}
              alt={school.name}
              width={200}
              height={200}
              style={{
                borderRadius: '24px',
                border: '4px solid white',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Main Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.2,
            display: 'flex',
          }}
        >
          Explore Events at {school.name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Discover campus events, parties, and activities
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
