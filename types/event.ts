export interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  venue: string
  address?: string
  distance?: string
  category: string
  isFree?: boolean
  organizer?: string
  organizationSlug?: string
  isOrgVerified?: boolean
  imageUrl?: string
  url?: string
  attendeeCount?: number
  isLive?: boolean
  isSoldOut?: boolean
  longitude?: number
  latitude?: number
}

export interface Marker {
  id: string
  longitude: number
  latitude: number
  title: string
  category: string
  type: 'club' | 'school' | 'dining_hall'
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  verified: boolean
  logo_url?: string
  banner_url?: string
  website_url?: string
  mailing_list_url?: string
  twitter_url?: string
  linkedin_url?: string
  instagram_url?: string
  school_id: string
  category?: string
}

export interface User {
  id: string
  email: string
  role?: string
}

export interface OrganizationAdmin {
  id: string
  organization_id: string
  user_id: string | null
  email: string
  role: 'admin' | 'owner'
  created_at: string
  invited_by?: string | null
  users?: User
}

export interface Invitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'owner'
  status: 'pending' | 'accepted' | 'cancelled'
  token: string
  created_at: string
  expires_at?: string
  invited_by?: string
}
