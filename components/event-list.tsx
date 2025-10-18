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
  imageUrl?: string
}

interface EventListProps {
  events?: Event[]
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
  onEventClick,
  className,
  isOpen = true,
  showHeader = true,
}: EventListProps) {
  return (
    <div
      className={cn(
        'bg-background border-l p-4 overflow-y-auto h-full',
        'w-96 max-w-[90vw] flex-shrink-0',
        !isOpen && 'hidden',
        className
      )}
    >
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List className="w-5 h-5" />
            Events ({events.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Showing events in current map area</p>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No events found in this area</p>
          <p className="text-sm mt-2">Try adjusting your filters or map view</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onClick={() => onEventClick?.(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

