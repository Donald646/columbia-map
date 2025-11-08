import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { Building2, School, Users, Calendar, ArrowRight } from 'lucide-react'

// Revalidate every 60 seconds for fresh data
export const revalidate = 60

export default async function SuperAdminDashboard() {
  const supabase = createAdminClient()

  // Parallelize all count queries for better performance
  const [
    { count: orgCount },
    { count: schoolCount },
    { count: userCount },
    { count: eventCount }
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true })
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform-wide management and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <div>
              <p className="text-3xl font-bold">{orgCount || 0}</p>
              <p className="text-sm opacity-90">Organizations</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <School className="w-8 h-8" />
            <div>
              <p className="text-3xl font-bold">{schoolCount || 0}</p>
              <p className="text-sm opacity-90">Schools</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-3xl font-bold">{userCount || 0}</p>
              <p className="text-sm opacity-90">Users</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <div>
              <p className="text-3xl font-bold">{eventCount || 0}</p>
              <p className="text-sm opacity-90">Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/superadmin/organizations/new" prefetch={true}>
            <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Create Organization</h3>
                  <p className="text-sm text-muted-foreground">Add a new club or student org</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </Link>

          <Link href="/superadmin/schools/new" prefetch={true}>
            <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Add School</h3>
                  <p className="text-sm text-muted-foreground">Register a new university</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </Link>

          <Link href="/superadmin/organizations" prefetch={true}>
            <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Manage Organizations</h3>
                  <p className="text-sm text-muted-foreground">View and edit all organizations</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </Link>

          <Link href="/superadmin/users" prefetch={true}>
            <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">User Management</h3>
                  <p className="text-sm text-muted-foreground">View all users and permissions</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
