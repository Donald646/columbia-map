'use client'

import React from 'react'
import { EventCard } from './event-card'
import { cn } from '@/lib/utils'
import { DbEventWithOrg } from '@/types/database-helpers'
import { formatTime } from '@/lib/utils/transform'

// Helper function to get date label
function getDateLabel(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const eventDate = new Date(date)
  eventDate.setHours(0, 0, 0, 0)

  if (eventDate.getTime() === today.getTime()) {
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
    return `Today / ${dayName}`
  } else if (eventDate.getTime() === tomorrow.getTime()) {
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' })
    return `Tomorrow / ${dayName}`
  } else {
    const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
    const monthDay = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    return `${dayName} / ${monthDay}`
  }
}

// Helper function to group events by date
function groupEventsByDate(events: DbEventWithOrg[]): Map<string, DbEventWithOrg[]> {
  const grouped = new Map<string, DbEventWithOrg[]>()

  events.forEach(event => {
    const eventDate = new Date(event.starts_at)
    eventDate.setHours(0, 0, 0, 0)
    const dateKey = eventDate.toISOString()

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(event)
  })

  return grouped
}

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
          {Array.from(groupEventsByDate(events)).map(([dateKey, dateEvents]) => {
            const date = new Date(dateKey)
            const dateLabel = getDateLabel(date)

            return (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="pt-6 pb-3">
                  <h3 className="text-base font-bold">{dateLabel}</h3>
                </div>

                {/* Events for this date */}
                {dateEvents.map((event) => {
                  // Handle organizations being either an array or object from Supabase
                  const organization = Array.isArray(event.organizations)
                    ? event.organizations[0]
                    : event.organizations

                  return (
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
                      organizer={organization?.name}
                      organizationSlug={organization?.slug}
                      schoolSlug={schoolSlug}
                      imageUrl={event.image_url || undefined}
                      isOrgVerified={organization?.verified}
                      onClick={() => onEventClick?.(event.id)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

