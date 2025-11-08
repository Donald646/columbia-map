'use client'

import React from 'react'
import { MapPin, Clock, Calendar, Share2, ExternalLink } from 'lucide-react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getGoogleMapsUrl } from '@/lib/utils/transform'

interface EventDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  event?: {
    id: string
    title: string
    description?: string
    startTime: string
    endTime?: string
    venue: string
    address?: string
    category: string
    organizer?: string
    isFree?: boolean
    url?: string
    imageUrl?: string
    attendeeCount?: number
    isLive?: boolean
    isSoldOut?: boolean
    longitude?: number
    latitude?: number
  }
}

export function EventDetailSheet({ isOpen, onClose, event }: EventDetailSheetProps) {
  if (!event) return null

  const isLive = event.isLive || false
  const isSoldOut = event.isSoldOut || false

  const dateMonth = 'OCT'
  const dateDay = '22'

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 overflow-y-auto"
      >
        {/* Small Square Centered Image - Like Luma */}
        <div className="w-full bg-background pt-4 pb-3 flex justify-center">
          <div className="relative w-64 h-64 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden rounded-xl">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isLive && (
                <Badge className="bg-red-500 text-white font-semibold gap-1.5 px-2.5 py-0.5 text-xs shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </Badge>
              )}
              {isSoldOut && (
                <Badge className="bg-gray-900 text-white font-semibold px-2.5 py-0.5 text-xs shadow-lg">
                  Sold Out
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Title */}
          <h1 className="text-2xl font-bold">{event.title}</h1>

          {/* Hosted by */}
          {event.organizer && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {event.organizer.charAt(0)}
              </div>
              <span className="text-sm">
                Hosted by {event.organizer}
              </span>
            </div>
          )}

          {/* Date & Location - SIDE BY SIDE like Luma - NO BORDERS */}
          <div className="grid grid-cols-2 gap-3 py-3">
            {/* Date */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center justify-center bg-muted rounded-lg text-center w-11 h-11 flex-shrink-0">
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">{dateMonth}</div>
                <div className="text-lg font-bold leading-none">{dateDay}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  Wednesday, October 22
                </div>
                <div className="text-xs text-muted-foreground">
                  {event.startTime} - {event.endTime || '1:30 PM'}
                </div>
              </div>
            </div>

            {/* Location */}
            {(() => {
              const mapsUrl = getGoogleMapsUrl(event.latitude || 0, event.longitude || 0, event.venue)
              const LocationContent = (
                <>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-clamp-1">{event.venue}</div>
                    {event.address && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{event.address}</div>
                    )}
                  </div>
                  {mapsUrl && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                </>
              )

              return mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  {LocationContent}
                </a>
              ) : (
                <div className="flex items-center gap-2.5">
                  {LocationContent}
                </div>
              )
            })()}
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-sm font-semibold">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              size="lg"
              className="rounded-full bg-black text-white hover:bg-black/90 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to calendar
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Hosted By Section - NO BORDER */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold mb-3">Hosted By</h3>
            {event.organizer && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold text-white">
                  {event.organizer.charAt(0)}
                </div>
                <div className="font-semibold text-sm">{event.organizer}</div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
