import { DbEventWithOrg } from '@/types/database-helpers'
import { Marker } from '@/types/event'

// Re-export for convenience
export type DbEvent = DbEventWithOrg

interface TransformedEvent {
  id: string
  title: string
  startTime: string
  endTime?: string
  venue: string
  address?: string
  category: string
  isFree: boolean
  organizer?: string
  organizationSlug?: string
  isOrgVerified: boolean
  imageUrl?: string
  description?: string
  url?: string
  longitude: number
  latitude: number
}

/**
 * Format timestamp to time
 * "2025-10-21T14:00:00Z" → "2:00 PM"
 */
export function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format timestamp to date
 * "2025-10-21T14:00:00Z" → "Friday, Oct 21"
 */
export function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Transform database event to UI format
 */
export function transformEvent(row: DbEvent): TransformedEvent {
  return {
    id: row.id,
    title: row.title,
    startTime: formatTime(row.starts_at),
    endTime: row.ends_at ? formatTime(row.ends_at) : undefined,
    venue: row.venue_name || 'TBA',
    category: row.category || 'other',
    isFree: row.is_free ?? true,
    organizer: row.organizations?.name,
    organizationSlug: row.organizations?.slug,
    isOrgVerified: row.organizations?.verified || false,
    imageUrl: row.image_url || undefined,
    description: row.description || undefined,
    address: row.venue_address || undefined,
    url: row.external_url || undefined,
    longitude: row.longitude || 0,
    latitude: row.latitude || 0,
  }
}

/**
 * Transform event to map marker
 */
export function eventToMarker(event: DbEvent): Marker {
  return {
    id: event.id,
    longitude: event.longitude || 0,
    latitude: event.latitude || 0,
    title: event.title,
    category: event.category || 'other',
    type: event.organization_id ? ('club' as const) : ('school' as const)
  }
}

/**
 * Generate Google Maps URL for a location
 * Prefers venue name for better UX, falls back to coordinates
 */
export function getGoogleMapsUrl(latitude: number, longitude: number, venueName?: string) {
  // Prefer venue name for better UX - shows actual place name instead of coordinates
  if (venueName && venueName !== 'TBA') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`
  }
  // Fall back to coordinates if no venue name
  if (latitude && longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }
  return null
}
