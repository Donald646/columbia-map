import { createClient } from '@/utils/supabase/server'
import SchoolNav from '../school-nav'

interface WithNavLayoutProps {
  children: React.ReactNode
  params: Promise<{ school: string }>
}

export default async function WithNavLayout({ children, params }: WithNavLayoutProps) {
  const { school: schoolSlug } = await params
  const supabase = await createClient()

  // Fetch school data and user info in parallel
  const [
    { data: { user } },
    { data: schoolData }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('schools')
      .select('name, horizontal_logo_url')
      .eq('slug', schoolSlug)
      .single()
  ])

  // Fetch user role and org admin status if logged in
  let userRole = null
  let isOrgAdmin = false

  console.log('[SCHOOL LAYOUT] User logged in:', !!user, 'email:', user?.email)

  if (user) {
    const [userData, orgAdmin] = await Promise.all([
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single(),
      supabase
        .from('organization_admins')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
    ])

    userRole = userData.data?.role || null
    isOrgAdmin = !!(orgAdmin.data && orgAdmin.data.length > 0)

    console.log('[SCHOOL LAYOUT] User role:', userRole, 'isOrgAdmin:', isOrgAdmin, 'userData:', userData)
  }

  return (
    <div className="min-h-screen bg-background">
      <SchoolNav
        schoolSlug={schoolSlug}
        schoolName={schoolData?.name || schoolSlug}
        schoolHorizontalLogo={schoolData?.horizontal_logo_url || null}
        user={user}
        userRole={userRole}
        isOrgAdmin={isOrgAdmin}
      />
      <main>
        {children}
      </main>
    </div>
  )
}
