import { createAdminClient } from '@/utils/supabase/adminClient'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SchoolForm } from '@/components/forms/school-form'

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (!school) {
    redirect('/superadmin/schools')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/superadmin/schools">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit School</h1>
        <p className="text-muted-foreground">{school.name}</p>
      </div>

      <SchoolForm school={school} redirectUrl="/superadmin/schools" />
    </div>
  )
}
