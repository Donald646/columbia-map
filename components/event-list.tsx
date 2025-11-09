'use client'

import React from 'react'
import { EventCard } from './event-card'
import { cn } from '@/lib/utils'
import { DbEventWithOrg } from '@/types/database-helpers'
import { formatTime } from '@/lib/utils/transform'

interface EventListProps {
  events?: DbEventWithOrg[]
  schoolSlug?: string
  onEventClick?: (eventId: string) => void
  className?: string
  isOpen?: boolean
  showHeader?: boolean
}

export function EventList({
  events = [],
  schoolSlug,
  onEventClick,
  className,
  isOpen = true,
  showHeader = true,
}: EventListProps) {
  return (
    <div
      className={cn(
        'bg-background border-l overflow-y-auto h-full custom-scrollbar',
        'w-96 max-w-[90vw] flex-shrink-0',
        !isOpen && 'hidden',
        className
      )}
    >
      {showHeader && (
        <div className="px-4 pt-4 pb-3 border-b">
          <h2 className="text-xl font-bold">
            Events
          </h2>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-sm text-muted-foreground">No events found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters or map view
          </p>
        </div>
      ) : (
        <div className=" pb-4">
          {/* Today / Monday */}
          <div className="pt-6 pb-3">
            <h3 className="text-base font-bold">Today / Monday</h3>
          </div>
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description || undefined}
              startTime={formatTime(event.starts_at)}
              endTime={event.ends_at ? formatTime(event.ends_at) : undefined}
              venue={event.venue_name || 'TBA'}
              category={event.category || 'other'}
              isFree={event.is_free ?? undefined}
              organizer={event.organizations?.name}
              organizationSlug={event.organizations?.slug}
              schoolSlug={schoolSlug}
              imageUrl={event.image_url || undefined}
              isOrgVerified={event.organizations?.verified}
              onClick={() => onEventClick?.(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

