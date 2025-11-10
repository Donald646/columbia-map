import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/data/auth'
import SuperAdminNav from './super-admin-nav'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('[SUPERADMIN LAYOUT] Starting layout render')
  const user = await requireSuperAdmin()
  console.log('[SUPERADMIN LAYOUT] requireSuperAdmin returned:', !!user, user?.email)

  if (!user) {
    console.log('[SUPERADMIN LAYOUT] No user, redirecting to login')
    redirect('/auth/login')
  }

  console.log('[SUPERADMIN LAYOUT] User authenticated, rendering layout')
  return (
    <div className="min-h-screen bg-background">
      <SuperAdminNav user={user} />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
