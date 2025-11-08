'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

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
  organizationSlug?: string
  schoolSlug?: string
  imageUrl?: string
  attendeeCount?: number
  isHighlighted?: boolean
  onClick?: () => void
  className?: string
}

export function EventCardLuma({
  title,
  startTime,
  endTime,
  venue,
  distance,
  organizer,
  organizationSlug,
  schoolSlug,
  imageUrl,
  attendeeCount,
  onClick,
  className,
}: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative transition-all duration-200 cursor-pointer py-2.5',
        'hover:bg-muted/50 -mx-4 px-4 rounded-md',
        className
      )}
    >
      <div className="flex gap-3">
        {/* Image/Thumbnail - LEFT Side like Luma - Smaller */}
        {imageUrl ? (
          <div className="w-[80px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-[80px] h-[80px] flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Clock className="w-7 h-7 text-muted-foreground/30" />
          </div>
        )}

        {/* Content - RIGHT Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
          {/* Title - Smaller */}
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground">
            {title}
          </h3>

          {/* Organizer */}
          {organizer && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {organizationSlug && schoolSlug ? (
                <Link
                  href={`/${schoolSlug}/organizations/${organizationSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="truncate hover:text-foreground hover:underline transition-colors"
                  prefetch={true}
                >
                  By {organizer}
                </Link>
              ) : (
                <span className="truncate">By {organizer}</span>
              )}
            </div>
          )}

          {/* Time and Location together */}
          <div className="text-xs text-muted-foreground">
            {startTime} · {venue}
          </div>
        </div>
      </div>
    </div>
  )
}
