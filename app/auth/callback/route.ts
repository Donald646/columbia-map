import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Allowed email domains for school verification
const ALLOWED_DOMAINS = [
  'columbia.edu',
  'barnard.edu',
  'nyu.edu',
  // Add more school domains as needed
]

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    const user = data.user
    const email = user?.email

    if (!email) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/auth/login?error=no_email`)
    }

    // Check if user has a valid invitation token (from next parameter)
    let hasValidInvitationToken = false
    if (next && next.includes('token=')) {
      // Extract token from the next URL
      const nextUrl = new URL(`${origin}${next}`)
      const token = nextUrl.searchParams.get('token')

      if (token) {
        // Validate the token
        const { data: tokenInvitation } = await supabase
          .from('organization_invitations')
          .select('id, email, status, expires_at')
          .eq('token', token)
          .single()

        hasValidInvitationToken = tokenInvitation &&
          tokenInvitation.status === 'pending' &&
          (!tokenInvitation.expires_at || new Date(tokenInvitation.expires_at) > new Date())
      }
    }

    // Check for organization admin access (both pending invitations and existing admins)
    const { data: adminRecords } = await supabase
      .from('organization_admins')
      .select('id, organization_id, user_id')
      .eq('email', email.toLowerCase())

    const hasAdminAccess = adminRecords && adminRecords.length > 0
    const hasPendingAdminInvite = adminRecords?.some(record => record.user_id === null)

    // Check if email domain is allowed (skip check if user has admin access or valid token)
    if (!hasAdminAccess && !hasValidInvitationToken) {
      const emailDomain = email.split('@')[1]
      const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
        emailDomain === domain || emailDomain.endsWith(`.${domain}`)
      )

      if (!isAllowedDomain) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/auth/login?error=invalid_domain&email=${encodeURIComponent(email)}`
        )
      }
    }

    // Create or update user record with verified school
    const emailDomain = email.split('@')[1]
    const { data: school } = await supabase
      .from('schools')
      .select('id, slug')
      .or(`domain.eq.${emailDomain},alternate_domains.cs.{${emailDomain}}`)
      .single()

    // Check if user already exists to preserve their role and admin flags
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role, is_super_admin, is_school_admin')
      .eq('id', user.id)
      .single()

    // Update or insert user record with profile data
    // Only set role/admin flags for NEW users, preserve for returning users
    await supabase.from('users').upsert({
      id: user.id,
      email: email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      google_id: user.user_metadata?.provider_id,
      primary_school_id: school?.id || null,
      role: existingUser?.role || 'user', // Preserve existing role, default to 'user' for new users
      is_super_admin: existingUser?.is_super_admin || false, // Preserve super admin status
      is_school_admin: existingUser?.is_school_admin || false, // Preserve school admin status
    })

    // Link pending organization admin invitations to this user
    if (hasPendingAdminInvite) {
      await supabase
        .from('organization_admins')
        .update({ user_id: user.id })
        .eq('email', email.toLowerCase())
        .is('user_id', null)
    }

    // Priority 1: If there's a 'next' parameter, redirect there (for invitation links)
    if (next && next.startsWith('/')) {
      // Validate that next is a safe redirect (starts with / but not //)
      if (!next.startsWith('//')) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // Priority 2: Check for pending invitations
    const { data: pendingInvitations } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')

    if (pendingInvitations && pendingInvitations.length > 0) {
      // Redirect to invitations page
      return NextResponse.redirect(`${origin}/invitations`)
    }

    // Priority 3: If user has admin access, redirect to admin dashboard
    if (hasAdminAccess) {
      return NextResponse.redirect(`${origin}/admin`)
    }

    // Priority 4: Redirect to user's school page if they have one
    if (school) {
      return NextResponse.redirect(`${origin}/${school.slug}`)
    }
  }

  // Default redirect to home page
  return NextResponse.redirect(`${origin}/`)
}
