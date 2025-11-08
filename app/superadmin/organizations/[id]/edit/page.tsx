import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import OrganizationForm from '@/app/superadmin/organizations/organization-form'

export default async function EditOrganizationPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  // Get the organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!org) {
    redirect('/superadmin/organizations')
  }

  // Get all schools
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/superadmin/organizations/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Organization
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit Organization</h1>
        <p className="text-muted-foreground">
          Update organization details
        </p>
      </div>

      <OrganizationForm
        schools={schools || []}
        organization={org}
        redirectUrl={`/superadmin/organizations/${params.id}`}
      />
    </div>
  )
}
