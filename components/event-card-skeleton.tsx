'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-muted/30 to-muted/10',
        'border backdrop-blur-sm',
        'animate-pulse',
        className
      )}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image Skeleton */}
          <div className="w-20 h-20 rounded-lg bg-muted/50 flex-shrink-0" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-muted/50" />
              <div className="h-5 w-12 rounded-full bg-muted/50" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted/50" />
              <div className="h-4 w-3/4 rounded bg-muted/50" />
            </div>

            {/* Organizer */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted/50" />
              <div className="h-3 w-24 rounded bg-muted/50" />
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded bg-muted/50" />
              <div className="h-3 w-28 rounded bg-muted/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  )
}

// Export multiple skeletons for list loading
export function EventListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}
