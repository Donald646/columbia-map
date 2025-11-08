export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-muted rounded mb-2" />
            <div className="h-4 w-2/3 bg-muted rounded mb-4" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
