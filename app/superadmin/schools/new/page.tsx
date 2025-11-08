import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SchoolForm } from '@/components/forms/school-form'

export default function NewSchoolPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/superadmin/schools">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Create School</h1>
        <p className="text-muted-foreground">
          Add a new school to the platform
        </p>
      </div>

      <SchoolForm redirectUrl="/superadmin/schools" />
    </div>
  )
}
