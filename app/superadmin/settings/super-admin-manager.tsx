'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
interface SuperAdminManagerProps {
  currentUserId: string
  superAdmins: { id: string; email: string }[]
  allUsers: { id: string; email: string }[]
}

export default function SuperAdminManager({ currentUserId, superAdmins, allUsers }: SuperAdminManagerProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter out users who are already super admins
  const availableUsers = allUsers.filter(
    user => !superAdmins.some(admin => admin.id === user.id)
  )

  const handleAddSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('users')
        .update({ role: 'super_admin' })
        .eq('id', selectedUserId)

      if (error) throw error

      toast.success('Super admin added successfully!')
      setShowAddForm(false)
      setSelectedUserId('')
      router.refresh()
    } catch (error) {
      console.error('Error adding super admin:', error)
      toast.error(`Failed to add super admin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSuperAdmin = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from super admins? They will be downgraded to regular user.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', userId)

      if (error) throw error

      toast.success('Super admin removed successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error removing super admin:', error)
      toast.error(`Failed to remove super admin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Super Administrators</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Users with full platform access
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Super Admin
        </Button>
      </div>

      {/* Add Super Admin Form */}
      {showAddForm && (
        <form onSubmit={handleAddSuperAdmin} className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-4">Add Super Administrator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User</label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  All registered users are already super admins
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !selectedUserId}>
                {loading ? 'Adding...' : 'Add Super Admin'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedUserId('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Current Super Admins */}
      <div className="space-y-2">
        {superAdmins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                {admin.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{admin.email}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Super Admin</span>
                  {admin.id === currentUserId && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">You</span>
                  )}
                </div>
              </div>
            </div>

            {admin.id !== currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSuperAdmin(admin.id, admin.email)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        {superAdmins.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">
            No super admins found. This shouldn&apos;t happen!
          </p>
        )}
      </div>
    </div>
  )
}
