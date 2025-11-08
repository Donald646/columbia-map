import { Skeleton } from '@/components/ui/skeleton'
import { EventCardSkeleton } from '@/components/event-card-skeleton'

export default function SchoolMapLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Event List Skeleton - Left Side */}
      <div className="w-full max-w-md border-r bg-background overflow-y-auto">
        {/* Header skeleton */}
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <div className="space-y-3">
            {/* Title and Filter button */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-9 w-16 rounded-lg" />
            </div>

            {/* Search bar */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Event cards skeleton */}
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Map Skeleton - Right Side */}
      <div className="flex-1 relative">
        {/* Map loading skeleton */}
        <Skeleton className="absolute inset-0" />

        {/* Map controls skeleton */}
        <div className="absolute top-4 right-4 space-y-2">
          <Skeleton className="w-10 h-10 rounded" />
          <Skeleton className="w-10 h-10 rounded" />
        </div>

        {/* Map center indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-muted-foreground/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="animate-pulse">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}