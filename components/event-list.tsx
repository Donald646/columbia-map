'use client'

import React from 'react'
import { EventCard } from './event-card'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface Event {
  id: string
  title: string
  startTime: string
  endTime?: string
  venue: string
  distance?: string
  category: string
  isFree?: boolean
  organizer?: string
  organizationSlug?: string
  imageUrl?: string
}

interface EventListProps {
  events?: Event[]
  schoolSlug?: string
  onEventClick?: (eventId: string) => void
  className?: string
  isOpen?: boolean
  showHeader?: boolean
}

const DEMO_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Butler Library Study Session',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    venue: 'Butler Library',
    distance: '0.1 mi',
    category: 'academic',
    isFree: true,
    organizer: 'Columbia College',
  },
  {
    id: '2',
    title: 'Lerner Hall Mixer',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    venue: 'Lerner Hall',
    distance: '0.2 mi',
    category: 'social',
    isFree: true,
    organizer: 'Student Affairs',
  },
  {
    id: '3',
    title: 'SEAS Career Fair Prep Workshop',
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    venue: 'Mudd Building',
    distance: '0.3 mi',
    category: 'career',
    isFree: true,
    organizer: 'SEAS',
  },
  {
    id: '4',
    title: 'Miller Theatre Concert: Contemporary Ensemble',
    startTime: '7:30 PM',
    endTime: '9:30 PM',
    venue: 'Miller Theatre',
    distance: '0.4 mi',
    category: 'arts',
    isFree: false,
    organizer: 'Miller Theatre',
  },
]

export function EventList({
  events = DEMO_EVENTS,
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
              {...event}
              schoolSlug={schoolSlug}
              onClick={() => onEventClick?.(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

