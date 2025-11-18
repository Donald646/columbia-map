import { Database } from '../database.types'

// Commonly used database row types
export type DbEvent = Database['public']['Tables']['events']['Row']
export type DbOrganization = Database['public']['Tables']['organizations']['Row']
export type DbOrganizationAdmin = Database['public']['Tables']['organization_admins']['Row']
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbSchool = Database['public']['Tables']['schools']['Row']
export type DbInvitation = Database['public']['Tables']['organization_invitations']['Row']
export type DbRsvp = Database['public']['Tables']['rsvps']['Row']

// Insert types for creating new records
export type InsertEvent = Database['public']['Tables']['events']['Insert']
export type InsertOrganization = Database['public']['Tables']['organizations']['Insert']
export type InsertOrganizationAdmin = Database['public']['Tables']['organization_admins']['Insert']
export type InsertInvitation = Database['public']['Tables']['organization_invitations']['Insert']

// Update types for modifying records
export type UpdateEvent = Database['public']['Tables']['events']['Update']
export type UpdateOrganization = Database['public']['Tables']['organizations']['Update']
export type UpdateOrganizationAdmin = Database['public']['Tables']['organization_admins']['Update']

// Extended types with relations
export type DbEventWithOrg = DbEvent & {
  organizations?: {
    name: string
    slug: string
    verified: boolean
    logo_url: string | null
  }
}

export type DbOrganizationAdminWithUser = DbOrganizationAdmin & {
  users?: DbUser
}

export type DbOrganizationAdminSimple = {
  id: string
  organization_id: string
  user_id: string | null
  email: string
  role: string | null
  created_at: string | null
  invitation_id: string | null
  invited_by: string | null
  users?: { id: string; email: string } | { id: string; email: string }[] | null
}
