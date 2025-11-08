import { getCurrentUser, getSuperAdmins } from '@/lib/data/auth'
import { createAdminClient } from '@/utils/supabase/adminClient'
import SuperAdminManager from './super-admin-manager'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const superAdmins = await getSuperAdmins()
  const supabase = createAdminClient()

  // Get all users for the dropdown
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, email')
    .order('email')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage platform settings and super administrators
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Platform Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
            <p className="text-lg">HapMap</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Your Email</label>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Super Admin Management */}
      <SuperAdminManager
        currentUserId={user!.id}
        superAdmins={superAdmins}
        allUsers={allUsers || []}
      />
    </div>
  )
}
