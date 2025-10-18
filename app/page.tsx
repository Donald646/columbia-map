import { getAllSchools } from '@/lib/schools/config'
import { SchoolCard } from '@/components/school-card'

export default function LandingPage() {
  const schools = getAllSchools()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Find Events at Your School
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover events, clubs, and activities happening on campus
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard
              key={school.slug}
              slug={school.slug}
              name={school.name}
              shortName={school.shortName}
              primaryColor={school.primaryColor}
              description={school.description}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see your school? <a href="#" className="text-primary font-medium underline">Request it here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

