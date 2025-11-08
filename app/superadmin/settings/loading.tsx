export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Super Admin Manager Skeleton */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-9 w-40 bg-muted rounded animate-pulse" />
        </div>

        {/* Admin List Skeleton */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div>
                  <div className="h-4 w-48 bg-muted rounded mb-2" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
