import { createAdminClient } from '@/utils/supabase/adminClient'
import { notFound } from 'next/navigation'
import OrganizationDetailWrapper from './organization-detail-wrapper'

export default async function OrganizationDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (!org) {
    notFound()
  }

  const breadcrumbs = [
    {
      label: 'Organizations',
      href: '/superadmin/organizations',
    },
    {
      label: org.name,
    },
  ]

  return (
    <OrganizationDetailWrapper breadcrumbs={breadcrumbs}>
      {children}
    </OrganizationDetailWrapper>
  )
}
