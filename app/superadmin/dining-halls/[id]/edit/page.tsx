import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/adminClient'
import DiningHallEditForm from './dining-hall-edit-form'

export default async function EditDiningHallPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch dining hall
  const { data: diningHall } = await supabase
    .from('dining_halls')
    .select(`
      *,
      schools (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (!diningHall) {
    notFound()
  }

  // Fetch all schools for the school selector
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Dining Hall</h1>
      <DiningHallEditForm diningHall={diningHall} schools={schools || []} />
    </div>
  )
}
