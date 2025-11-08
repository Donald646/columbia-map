export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>

      {/* Events List Skeleton */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-64 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded-full" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-4 w-36 bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
