import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { Plus, Building2, Users } from 'lucide-react'

// Revalidate every 30 seconds for fresh organization data
export const revalidate = 30

export default async function OrganizationsPage() {
  const supabase = createAdminClient()

  // Check current user
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user?.id, user?.email)

  // Check user role
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single()
    console.log('User data from database:', userData)
  }

  // Optimize query - only select fields we need
  // Use !organizations_school_id_fkey to specify which relationship to use
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      description,
      verified,
      slug,
      logo_url,
      schools!organizations_school_id_fkey (name, slug),
      organization_admins (count)
    `)
    .order('created_at', { ascending: false })

  console.log('Organizations query result:', {
    count: organizations?.length || 0,
    error: error,
    organizations: organizations
  })

  if (error) {
    console.error('Error fetching organizations:', error)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizations</h1>
          <p className="text-muted-foreground">
            {organizations?.length || 0} total organizations
          </p>
        </div>

        <Link href="/superadmin/organizations/new" prefetch={true}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Organization
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations && organizations.length > 0 ? (
          organizations.map((org) => (
            <Link
              key={org.id}
              href={`/superadmin/organizations/${org.id}`}
              className="block"
              prefetch={true}
            >
              <div className="bg-card border rounded-lg p-6 hover:border-primary transition-colors h-full">
                <div className="flex items-start gap-3 mb-4">
                  {org.logo_url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                      <Image
                        src={org.logo_url}
                        alt={org.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{org.name}</h3>
                    {org.schools && (
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(org.schools) ? org.schools[0]?.name : (org.schools as { name: string }).name}
                      </p>
                    )}
                  </div>
                </div>

                {org.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {org.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{org.organization_admins?.[0]?.count || 0} admins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${org.verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>{org.verified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-card border border-dashed rounded-lg p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating your first organization
            </p>
            <Link href="/superadmin/organizations/new" prefetch={true}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Organization
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
