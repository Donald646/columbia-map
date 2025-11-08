import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-6 animate-pulse">
            <div className="h-8 w-8 bg-muted-foreground/20 rounded mb-2" />
            <div className="h-9 w-16 bg-muted-foreground/20 rounded mb-2" />
            <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-card border rounded-lg p-6">
        <div className="h-7 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-5 w-40 bg-muted rounded mb-2" />
              <div className="h-4 w-56 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
