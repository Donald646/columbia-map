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

  console.log('[AUTH CALLBACK] Starting callback with code:', !!code, 'next:', next)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.log('[AUTH CALLBACK] Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    const user = data.user
    const email = user?.email

    console.log('[AUTH CALLBACK] User authenticated:', email)

    if (!email) {
      console.log('[AUTH CALLBACK] No email found')
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

        hasValidInvitationToken = !!(tokenInvitation &&
          tokenInvitation.status === 'pending' &&
          (!tokenInvitation.expires_at || new Date(tokenInvitation.expires_at) > new Date()))
      }
    }

    // Check for organization admin access (both pending invitations and existing admins)
    const { data: adminRecords } = await supabase
      .from('organization_admins')
      .select('id, organization_id, user_id')
      .eq('email', email.toLowerCase())

    const hasAdminAccess = adminRecords && adminRecords.length > 0
    const hasPendingAdminInvite = adminRecords?.some(record => record.user_id === null)

    console.log('[AUTH CALLBACK] Admin check - hasAdminAccess:', hasAdminAccess, 'hasPendingAdminInvite:', hasPendingAdminInvite)

    // Check if email domain is allowed (skip check if user has admin access or valid token)
    if (!hasAdminAccess && !hasValidInvitationToken) {
      const emailDomain = email.split('@')[1]
      const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
        emailDomain === domain || emailDomain.endsWith(`.${domain}`)
      )

      console.log('[AUTH CALLBACK] Domain check - emailDomain:', emailDomain, 'isAllowed:', isAllowedDomain)

      if (!isAllowedDomain) {
        console.log('[AUTH CALLBACK] Invalid domain, signing out')
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

    console.log('[AUTH CALLBACK] School lookup - emailDomain:', emailDomain, 'school found:', school?.slug)

    // Check if user already exists to preserve their role
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single()

    console.log('[AUTH CALLBACK] Existing user check - exists:', !!existingUser, 'role:', existingUser?.role)

    // Update or insert user record with profile data
    // Only set role for NEW users, preserve for returning users
    const upsertData = {
      id: user.id,
      email: email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      google_id: user.user_metadata?.provider_id,
      primary_school_id: school?.id || null,
      role: existingUser?.role || 'user', // Preserve existing role, default to 'user' for new users
    }

    console.log('[AUTH CALLBACK] Upserting user with data:', upsertData)

    await supabase.from('users').upsert(upsertData)

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
        console.log('[AUTH CALLBACK] Redirecting to next parameter:', next)
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // Priority 2: Check if user is a super admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isSuperAdmin = userData?.role === 'super_admin'
    console.log('[AUTH CALLBACK] User role:', userData?.role, 'isSuperAdmin:', isSuperAdmin)

    if (isSuperAdmin) {
      console.log('[AUTH CALLBACK] Redirecting super admin to /superadmin')
      return NextResponse.redirect(`${origin}/superadmin`)
    }

    // Priority 3: Check for pending invitations
    const { data: pendingInvitations } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')

    console.log('[AUTH CALLBACK] Pending invitations:', pendingInvitations?.length || 0)

    if (pendingInvitations && pendingInvitations.length > 0) {
      // Redirect to invitations page
      console.log('[AUTH CALLBACK] Redirecting to /invitations')
      return NextResponse.redirect(`${origin}/invitations`)
    }

    // Priority 4: If user has admin access, redirect to admin dashboard
    if (hasAdminAccess) {
      console.log('[AUTH CALLBACK] Redirecting to /admin')
      return NextResponse.redirect(`${origin}/admin`)
    }

    // Priority 5: Redirect to user's school page if they have one
    if (school) {
      console.log('[AUTH CALLBACK] Redirecting to school page:', school.slug)
      return NextResponse.redirect(`${origin}/${school.slug}`)
    }

    console.log('[AUTH CALLBACK] No specific redirect, going to home')
  }

  // Default redirect to home page
  console.log('[AUTH CALLBACK] Default redirect to home')
  return NextResponse.redirect(`${origin}/`)
}
