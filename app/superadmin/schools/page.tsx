import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/utils/supabase/adminClient'
import { Plus, School, MapPin } from 'lucide-react'

export default async function SchoolsPage() {
  const supabase = createAdminClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Schools</h1>
          <p className="text-muted-foreground">
            {schools?.length || 0} total schools
          </p>
        </div>

        <Link href="/superadmin/schools/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add School
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools && schools.length > 0 ? (
          schools.map((school) => (
            <Link
              key={school.id}
              href={`/superadmin/schools/${school.id}`}
              className="block"
            >
              <div className="bg-card border rounded-lg p-6 hover:border-primary transition-colors h-full">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {school.logo_url ? (
                      <Image
                        src={school.logo_url}
                        alt={school.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <School className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">/{school.slug}</p>
                  </div>
                </div>

                {school.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{school.location}</span>
                  </div>
                )}

                {(school.domain || school.email_domain) && (
                  <div className="text-sm text-muted-foreground font-mono">
                    {school.domain || school.email_domain}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-card border border-dashed rounded-lg p-12 text-center">
            <School className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No schools yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by adding your first school
            </p>
            <Link href="/superadmin/schools/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add School
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
