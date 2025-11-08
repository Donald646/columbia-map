import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/data/auth'
import SuperAdminNav from './super-admin-nav'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireSuperAdmin()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminNav user={user} />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
