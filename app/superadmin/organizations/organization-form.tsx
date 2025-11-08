import { OrganizationForm } from '@/components/forms/organization-form'

interface OrganizationFormProps {
  schools: any[]
  organization?: any
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
