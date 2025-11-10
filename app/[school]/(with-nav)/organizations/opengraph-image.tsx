import { ImageResponse } from 'next/og'
import { getSchool } from '@/lib/data/events'
import { getOrganizationsBySchool } from '@/lib/data/organizations'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Organizations on EventsCU'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: Promise<{ school: string }> }) {
  const { school: schoolSlug } = await params

  // Fetch school data and organizations
  const [school, organizations] = await Promise.all([
    getSchool(schoolSlug),
    getOrganizationsBySchool(schoolSlug)
  ])

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

  const orgCount = organizations?.length || 0

  // Check if logo is supported format (not AVIF or WEBP)
  const isLogoSupported = school.logo_url &&
    !school.logo_url.toLowerCase().includes('.avif') &&
    !school.logo_url.toLowerCase().includes('.webp')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          position: 'relative',
        }}
      >
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
          }}
        >
          {/* Top - Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
            {/* School Logo */}
            {isLogoSupported && (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  background: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={school.logo_url!}
                  alt={school.name}
                  width="80"
                  height="80"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

          {/* Center - Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.1,
                display: 'flex',
              }}
            >
              Organizations
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 36,
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.3,
                display: 'flex',
              }}
            >
              at {school.name}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.5,
                display: 'flex',
                maxWidth: '800px',
              }}
            >
              Discover and explore student organizations. Find clubs, societies, and student groups.
            </div>
          </div>

          {/* Bottom - Call to Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
              }}
            >
              Browse all campus organizations
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
