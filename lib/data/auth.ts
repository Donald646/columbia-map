import { createClient } from '@/utils/supabase/server'

/**
 * Check if the current user is authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get user's role from database
 */
export async function getUserRole(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role || 'user'
}

/**
 * Check if user is a super admin (platform owner)
 */
export async function isSuperAdmin(userId: string) {
  const role = await getUserRole(userId)
  return role === 'super_admin'
}

/**
 * Check if user is a school admin
 */
export async function isSchoolAdmin(userId: string) {
  const role = await getUserRole(userId)
  return role === 'school_admin' || role === 'super_admin'
}

/**
 * Get all super admins
 */
export async function getSuperAdmins() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'super_admin')
    .order('created_at', { ascending: true })

  return data || []
}

/**
 * Require super admin access
 */
export async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user) return null

  const isSuper = await isSuperAdmin(user.id)
  if (!isSuper) return null

  return user
}

/**
 * Check if user is an admin for any organization
 */
export async function isUserAdmin(userId: string) {
  const supabase = await createClient()

  const { data: adminRoles } = await supabase
    .from('organization_admins')
    .select('*')
    .eq('user_id', userId)
    .in('role', ['owner', 'admin'])

  return adminRoles && adminRoles.length > 0
}

/**
 * Get user's organizations where they have admin access
 */
export async function getUserOrganizations(userId: string) {
  const supabase = await createClient()

  const { data: adminRoles } = await supabase
    .from('organization_admins')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', userId)
    .in('role', ['owner', 'admin'])

  return adminRoles?.map(role => ({
    ...role.organizations,
    role: role.role
  })) || []
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  return user
}

/**
 * Require admin access - redirect if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (!user) return null

  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) return null

  return user
}
