'use client'

import React from 'react'
import { MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface EventCardProps {
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
  onClick?: () => void
  className?: string
}

export function EventCard({
  title,
  startTime,
  endTime,
  venue,
  distance,
  category,
  isFree,
  organizer,
  imageUrl,
  onClick,
  className,
}: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden hover:border-primary transition-colors cursor-pointer bg-card border rounded-lg',
        className
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Image - LEFT SIDE */}
        {imageUrl ? (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600 opacity-50" />
          </div>
        )}

        {/* Content - RIGHT SIDE */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-base leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Organizer */}
          {organizer && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                {organizer.charAt(0)}
              </div>
              <span>By {organizer}</span>
            </div>
          )}

          {/* Time + Location */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{startTime}</span>
            <span>•</span>
            <MapPin className="w-3 h-3" />
            <span className="truncate">{venue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

