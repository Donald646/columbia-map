import { COLUMBIA_DEMO_EVENTS, COLUMBIA_DEMO_MARKERS } from './events/columbia'
import { NYU_DEMO_EVENTS, NYU_DEMO_MARKERS } from './events/nyu'

export interface SchoolConfig {
  slug: string
  name: string
  shortName: string
  emailDomain: string
  
  // Branding
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
  
  // Map Configuration
  mapCenter: {
    longitude: number
    latitude: number
  }
  mapZoom: number
  mapBearing: number
  
  // Meta
  description: string
  timezone: string
  
  // Sample Data (for demo)
  sampleEvents: any[]
  sampleMarkers: any[]
}

const COLUMBIA: SchoolConfig = {
  slug: 'columbia',
  name: 'Columbia University',
  shortName: 'Columbia',
  emailDomain: 'columbia.edu',
  
  primaryColor: '#1E40AF',
  secondaryColor: '#93C5FD',
  logoUrl: null,
  
  mapCenter: {
    longitude: -73.9626,
    latitude: 40.8075,
  },
  mapZoom: 15.5,
  mapBearing: 29,
  
  description: 'Discover events and clubs at Columbia University',
  timezone: 'America/New_York',
  
  sampleEvents: COLUMBIA_DEMO_EVENTS,
  sampleMarkers: COLUMBIA_DEMO_MARKERS,
}

const NYU: SchoolConfig = {
  slug: 'nyu',
  name: 'New York University',
  shortName: 'NYU',
  emailDomain: 'nyu.edu',
  
  primaryColor: '#57068C',
  secondaryColor: '#B794F4',
  logoUrl: null,
  
  mapCenter: {
    longitude: -73.9972,
    latitude: 40.7295,
  },
  mapZoom: 15.5,
  mapBearing: 0,
  
  description: 'Discover events and clubs at NYU',
  timezone: 'America/New_York',
  
  sampleEvents: NYU_DEMO_EVENTS,
  sampleMarkers: NYU_DEMO_MARKERS,
}

export const SCHOOLS: Record<string, SchoolConfig> = {
  columbia: COLUMBIA,
  nyu: NYU,
}

export function getSchoolBySlug(slug: string): SchoolConfig | null {
  return SCHOOLS[slug] || null
}

export function getAllSchools(): SchoolConfig[] {
  return Object.values(SCHOOLS)
}

export function isValidSchoolSlug(slug: string): boolean {
  return slug in SCHOOLS
}

