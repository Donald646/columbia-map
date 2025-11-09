import { OrganizationForm } from '@/components/forms/organization-form'
import { DbOrganization } from '@/types/database-helpers'

interface OrganizationFormProps {
  schools: { id: string; name: string }[]
  organization?: DbOrganization
  redirectUrl?: string
}

export default function OrganizationFormWrapper({ schools, organization, redirectUrl }: OrganizationFormProps) {
  return (
    <OrganizationForm
      schools={schools}
      organization={organization}
      redirectUrl={redirectUrl || '/superadmin/organizations'}
      showVerifiedToggle={true}
      showSchoolSelector={true}
      showSlugField={true}
    />
  )
}
