export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left py-3 px-4">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </th>
                <th className="text-left py-3 px-4">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
