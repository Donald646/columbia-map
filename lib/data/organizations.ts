import { createClient } from '@/utils/supabase/server'
import { DbOrganization, DbEvent } from '@/types/database-helpers'

/**
 * Fetch organizations for a school (server-side)
 */
export async function getOrganizationsBySchool(schoolSlug: string, options?: {
  searchQuery?: string
  category?: string
  verified?: boolean
}) {
  const supabase = await createClient()

  // First get school ID from slug
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', schoolSlug)
    .single()

  if (!school) return []

  // Build query - only active organizations with this school_id
  let query = supabase
    .from('organizations')
    .select('*')
    .eq('school_id', school.id)
    .eq('status', 'active')
    .order('verified', { ascending: false })
    .order('name', { ascending: true })

  // Apply optional filters
  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category)
  }

  if (options?.verified !== undefined) {
    query = query.eq('verified', options.verified)
  }

  // Search filter (name or description)
  if (options?.searchQuery) {
    query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`)
  }

  const { data } = await query

  return data || []
}

/**
 * Fetch single organization by slug with related data (server-side)
 */
export async function getOrganizationBySlug(slug: string): Promise<(DbOrganization & { upcomingEvents: DbEvent[], pastEvents: DbEvent[] }) | null> {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!org) return null

  // Fetch upcoming and past events in parallel
  const now = new Date().toISOString()

  const [upcomingEvents, pastEvents] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('organization_id', org.id)
      .eq('status', 'published')
      .gte('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(10),
    supabase
      .from('events')
      .select('*')
      .eq('organization_id', org.id)
      .eq('status', 'published')
      .lt('starts_at', now)
      .order('starts_at', { ascending: false })
      .limit(10)
  ])

  return {
    ...org,
    upcomingEvents: upcomingEvents.data || [],
    pastEvents: pastEvents.data || []
  }
}

/**
 * Get organization count for a school
 */
export async function getOrganizationCount(schoolSlug: string) {
  const supabase = await createClient()

  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', schoolSlug)
    .single()

  if (!school) return 0

  const { count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', school.id)
    .eq('status', 'active')

  return count || 0
}
