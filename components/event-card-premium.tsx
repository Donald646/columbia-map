'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'
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
  attendeeCount?: number
  isHighlighted?: boolean
  onClick?: () => void
  className?: string
}

const categoryColors = {
  academic: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
  social: 'from-purple-500/10 to-pink-600/10 border-purple-500/20',
  career: 'from-green-500/10 to-emerald-600/10 border-green-500/20',
  arts: 'from-orange-500/10 to-red-600/10 border-orange-500/20',
  sports: 'from-yellow-500/10 to-amber-600/10 border-yellow-500/20',
  service: 'from-teal-500/10 to-cyan-600/10 border-teal-500/20',
  other: 'from-gray-500/10 to-slate-600/10 border-gray-500/20',
}

const categoryBadgeColors = {
  academic: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  social: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  career: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  arts: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
  sports: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
  service: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
}

export function EventCardPremium({
  title,
  startTime,
  endTime,
  venue,
  distance,
  category,
  isFree,
  organizer,
  imageUrl,
  attendeeCount,
  isHighlighted,
  onClick,
  className,
}: EventCardProps) {
  const categoryGradient = categoryColors[category as keyof typeof categoryColors] || categoryColors.other
  const badgeColor = categoryBadgeColors[category as keyof typeof categoryBadgeColors] || categoryBadgeColors.other

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer',
        'bg-gradient-to-br',
        categoryGradient,
        'border backdrop-blur-sm',
        'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5',
        isHighlighted && 'ring-2 ring-primary shadow-lg scale-[1.02]',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      <div className="relative p-4">
        <div className="flex gap-4">
          {/* Image/Icon Section */}
          <div className="relative flex-shrink-0">
            {imageUrl ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden ring-1 ring-black/5">
                <Image
                  src={imageUrl}
                  alt={title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className={cn(
                'w-20 h-20 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br backdrop-blur-sm',
                categoryGradient
              )}>
                <Clock className="w-8 h-8 text-foreground/40" />
              </div>
            )}

            {/* Distance Badge */}
            {distance && (
              <div className="absolute -bottom-1 -right-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium border shadow-sm">
                {distance}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Category & Free Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn('text-xs font-medium border', badgeColor)}
              >
                {category}
              </Badge>
              {isFree && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20">
                  Free
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Organizer */}
            {organizer && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {organizer.charAt(0)}
                </div>
                <span className="line-clamp-1">{organizer}</span>
              </div>
            )}

            {/* Time & Location */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{startTime}</span>
                {endTime && (
                  <>
                    <span className="text-muted-foreground/60">→</span>
                    <span className="font-medium">{endTime}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{venue}</span>
              </div>
            </div>

            {/* Attendee Count */}
            {attendeeCount && attendeeCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{attendeeCount} attending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}
