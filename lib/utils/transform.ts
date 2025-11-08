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
export function transformEvent(row: any) {
  return {
    id: row.id,
    title: row.title,
    startTime: formatTime(row.starts_at),
    endTime: row.ends_at ? formatTime(row.ends_at) : undefined,
    venue: row.venue_name,
    category: row.category || 'other',
    isFree: row.is_free ?? true,
    organizer: row.organizations?.name,
    organizationSlug: row.organizations?.slug,
    imageUrl: row.image_url,
    attendeeCount: row.attendee_count || 0,
    description: row.description,
    address: row.venue_address,
    url: row.external_url,
    longitude: row.longitude || 0,
    latitude: row.latitude || 0,
  }
}

/**
 * Transform event to map marker
 */
export function eventToMarker(event: any) {
  return {
    id: event.id,
    longitude: event.longitude,
    latitude: event.latitude,
    title: event.title,
    category: event.category,
    type: event.organizer ? 'club' : 'school'
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
