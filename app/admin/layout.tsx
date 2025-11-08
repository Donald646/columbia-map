import { redirect } from 'next/navigation'
import { requireAdmin, getUserOrganizations } from '@/lib/data/auth'
import AdminNav from './admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  if (!user) {
    redirect('/auth/login')
  }

  const organizations = await getUserOrganizations(user.id)

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={user} organizations={organizations} />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
