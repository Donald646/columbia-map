import { createClient } from '@/utils/supabase/server'
import { transformEvent } from '@/lib/utils/transform'

/**
 * Fetch events for a school (server-side)
 */
export async function getEvents(schoolSlug: string, filters?: {
  category?: string
  timeRange?: string
  isFree?: boolean
}) {
  const supabase = await createClient()

  // First get school ID from slug
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', schoolSlug)
    .single()

  if (!school) return []

  // Build query
  let query = supabase
    .from('events')
    .select(`
      *,
      organizations (name, slug, logo_url)
    `)
    .eq('school_id', school.id)
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(50)

  // Apply filters
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters?.isFree !== undefined) {
    query = query.eq('is_free', filters.isFree)
  }

  // Time range filter
  if (filters?.timeRange && filters.timeRange !== 'all') {
    const endDate = new Date()

    if (filters.timeRange === 'today') {
      endDate.setHours(23, 59, 59, 999)
    } else if (filters.timeRange === 'tomorrow') {
      endDate.setDate(endDate.getDate() + 1)
      endDate.setHours(23, 59, 59, 999)
    } else if (filters.timeRange === 'week') {
      endDate.setDate(endDate.getDate() + 7)
    }

    query = query.lte('starts_at', endDate.toISOString())
  }

  const { data: rows } = await query

  // Transform to UI format
  return (rows || []).map(transformEvent)
}

/**
 * Fetch single event by ID (server-side)
 */
export async function getEventById(eventId: string) {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from('events')
    .select(`
      *,
      organizations (name, slug, logo_url, verified),
      venues (name, address)
    `)
    .eq('id', eventId)
    .single()

  if (!row) return null

  return transformEvent(row)
}

/**
 * Get school data by slug
 */
export async function getSchool(slug: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .single()

  return data
}
