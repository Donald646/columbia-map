'use client'

import React from 'react'
import { Clock, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { RichTextViewer } from '@/components/ui/rich-text-viewer'

interface EventCardProps {
  id: string
  title: string
  description?: string
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
  isOrgVerified?: boolean
  onClick?: () => void
  className?: string
}

export function EventCardLuma({
  title,
  description,
  startTime,
  venue,
  organizer,
  organizationSlug,
  schoolSlug,
  imageUrl,
  isOrgVerified,
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
                  className="truncate hover:text-foreground hover:underline transition-colors flex items-center gap-1"
                  prefetch={true}
                >
                  <span>By {organizer}</span>
                  {isOrgVerified && (
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  )}
                </Link>
              ) : (
                <span className="truncate flex items-center gap-1">
                  <span>By {organizer}</span>
                  {isOrgVerified && (
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  )}
                </span>
              )}
            </div>
          )}

          {/* Description - Truncated */}
          {description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              <RichTextViewer content={description} className="text-xs" />
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
