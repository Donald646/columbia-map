import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col">
      {/* BANNER HERO with Overlapping Logo Skeleton */}
      <div className="mb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* Banner */}
          <Skeleton className="w-full h-28 md:h-36 rounded-lg" />

          {/* Logo */}
          <div className="absolute -bottom-8 left-4 md:left-6">
            <Skeleton className="w-16 h-16 md:w-18 md:h-18 rounded-lg border-4 border-background" />
          </div>
        </div>
      </div>

      {/* Organization Name and Info Skeleton */}
      <div className="px-4 md:px-6 mb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Mobile Tabs Skeleton */}
      <div className="md:hidden px-4 mb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 border-b">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-6">
        <div className="max-w-4xl mx-auto w-full h-full flex overflow-hidden">
          {/* Desktop Left Sidebar Navigation Skeleton */}
          <div className="hidden md:block w-64 border-r pr-6 py-4 space-y-1 flex-shrink-0">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-9 rounded-md" />
            ))}
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1 overflow-y-auto md:pl-6">
            <div className="pb-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Skeleton className="h-7 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full sm:w-32" />
              </div>

              {/* Event Cards Skeleton */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-3 mb-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="w-9 h-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}