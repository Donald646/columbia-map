import { ImageResponse } from 'next/og'
import { getOrganizationBySlug } from '@/lib/data/organizations'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Organization on EventsCU'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch organization data
  const orgData = await getOrganizationBySlug(slug)

  if (!orgData) {
    // Fallback for invalid organization
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

  // Check if logo is supported format (not AVIF or WEBP)
  const isLogoSupported = orgData.logo_url &&
    !orgData.logo_url.toLowerCase().includes('.avif') &&
    !orgData.logo_url.toLowerCase().includes('.webp')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
        }}
      >
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
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
          {/* Top - Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
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

          {/* Center - Organization Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Organization Logo */}
            <div
              style={{
                display: 'flex',
                width: '200px',
                height: '200px',
                borderRadius: '24px',
                background: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {isLogoSupported ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={orgData.logo_url!}
                  alt={orgData.name}
                  width="200"
                  height="200"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 'bold',
                    color: '#667eea',
                    display: 'flex',
                  }}
                >
                  {orgData.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Organization Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
              }}
            >
              {/* Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: 1.2,
                    display: 'flex',
                  }}
                >
                  {orgData.name.length > 30 ? orgData.name.substring(0, 30) + '...' : orgData.name}
                </div>
                {orgData.verified && (
                  <div
                    style={{
                      fontSize: 48,
                      color: '#3b82f6',
                      display: 'flex',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>

              {/* Description */}
              {orgData.description && (
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.4,
                    display: 'flex',
                  }}
                >
                  {orgData.description.length > 120
                    ? orgData.description.substring(0, 120) + '...'
                    : orgData.description}
                </div>
              )}
            </div>
          </div>

          {/* Bottom - Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
              }}
            >
              View all events and information
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
