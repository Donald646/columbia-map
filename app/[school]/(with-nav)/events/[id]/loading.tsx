import { Skeleton } from '@/components/ui/skeleton'

export default function EventDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-24 mb-6" />

        {/* Event header skeleton */}
        <div className="bg-card border rounded-lg overflow-hidden">
          {/* Hero image skeleton */}
          <Skeleton className="w-full h-64" />

          <div className="p-6 space-y-6">
            {/* Title and category */}
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            {/* Date and time */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            {/* Organization */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-24" />
            </div>
          </div>
        </div>

        {/* Map skeleton */}
        <div className="mt-6 bg-card border rounded-lg overflow-hidden">
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    </div>
  )
}