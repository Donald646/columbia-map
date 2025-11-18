import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'

export default function OrganizationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-5 w-96 mb-8" />

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Contact Banner */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="border rounded-lg p-6 bg-muted/50">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 bg-card">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
