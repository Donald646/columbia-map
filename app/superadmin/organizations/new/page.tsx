import { createAdminClient } from '@/utils/supabase/adminClient'
import OrganizationForm from '../organization-form'

export default async function NewOrganizationPage() {
  const supabase = createAdminClient()

  // Get all schools for dropdown
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Organization</h1>
        <p className="text-muted-foreground">
          Add a new club or student organization
        </p>
      </div>

      <OrganizationForm schools={schools || []} />
    </div>
  )
}
