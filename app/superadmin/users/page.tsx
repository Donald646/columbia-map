import { createAdminClient } from '@/utils/supabase/adminClient'
import { Users, Mail, Calendar } from 'lucide-react'

// Revalidate every 30 seconds for fresh user data
export const revalidate = 30

export default async function UsersPage() {
  const supabase = createAdminClient()

  // Optimize query - only select fields we need
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      email,
      created_at,
      email_verified,
      schools!inner (name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">
          {users?.length || 0} registered users
        </p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 font-medium text-sm">School</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.schools?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.email_verified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
