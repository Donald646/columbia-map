import { getSchoolBySlug } from '@/lib/schools/config'
import { SchoolProvider } from '@/lib/school-context'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface SchoolLayoutProps {
  children: React.ReactNode
  params: { school: string }
}

export async function generateMetadata({ 
  params 
}: { 
  params: { school: string } 
}): Promise<Metadata> {
  const school = getSchoolBySlug(params.school)
  
  if (!school) {
    return { title: 'School Not Found' }
  }
  
  return {
    title: `${school.name} Events`,
    description: school.description,
  }
}

export default function SchoolLayout({ children, params }: SchoolLayoutProps) {
  const school = getSchoolBySlug(params.school)
  
  if (!school) {
    notFound()
  }
  
  return (
    <SchoolProvider school={school}>
      <div 
        style={{
          '--color-primary': school.primaryColor,
          '--color-secondary': school.secondaryColor,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </SchoolProvider>
  )
}

