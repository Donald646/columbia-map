'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Trash2, Crown, Shield, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { DbOrganizationAdminSimple } from '@/types/database-helpers'

interface SuperAdminTeamManagerProps {
  organizationId: string
  admins: DbOrganizationAdminSimple[]
  allUsers: { id: string; email: string }[]
}

export default function SuperAdminTeamManager({ organizationId, admins }: SuperAdminTeamManagerProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'owner'>('admin')
  const [loading, setLoading] = useState(false)

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Check if email is already an admin for this org
      const { data: existing } = await supabase
        .from('organization_admins')
        .select('email')
        .eq('organization_id', organizationId)
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        toast.error('This email is already an admin for this organization')
        setLoading(false)
        return
      }

      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      // Insert admin record
      const { error } = await supabase
        .from('organization_admins')
        .insert({
          organization_id: organizationId,
          user_id: existingUser?.id || null,
          email: email.toLowerCase(),
          role: selectedRole,
        })

      if (error) throw error

      if (existingUser) {
        toast.success(`${email} added as ${selectedRole}`)
      } else {
        toast.success(`Invitation sent to ${email}. They can sign in with Google to accept.`)
      }

      setShowAddForm(false)
      setEmail('')
      router.refresh()
    } catch (error) {
      console.error('Error adding admin:', error)
      toast.error(`Failed to add admin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string, userEmail: string) => {
    if (!confirm(`Remove ${userEmail} from this organization?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organization_admins')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error removing admin:', error)
      alert(`Failed to remove admin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Team Members ({admins.length})</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <form onSubmit={handleAddAdmin} className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-4">Invite Team Member</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter any email address. If they don&apos;t have an account, they can sign in with Google using that email.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Any email domain is accepted (not just @columbia.edu)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'owner')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !email}>
                {loading ? 'Adding...' : 'Invite Member'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEmail('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Current Members */}
      <div className="space-y-2">
        {admins.map((admin) => {
          const users = Array.isArray(admin.users) ? admin.users[0] : admin.users
          const displayEmail = admin.email || users?.email
          const isPending = !admin.user_id

          return (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {displayEmail?.[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{displayEmail}</p>
                    {isPending && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {admin.role === 'owner' ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Owner
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {isPending && (
                      <span className="text-xs">· Invitation sent</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAdmin(admin.id, displayEmail || 'user')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        })}

        {admins.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">
            No team members yet. Add the first admin to get started.
          </p>
        )}
      </div>
    </div>
  )
}
