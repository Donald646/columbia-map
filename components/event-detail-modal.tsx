'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Clock, Calendar, Share2, X, Users, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventDetailModalProps {
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
  }
}

export function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!event) return null

  // Check if event is happening now (mock logic - you can implement real logic)
  const isLive = event.isLive || false
  const isSoldOut = event.isSoldOut || false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur-sm w-8 h-8 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity z-10 shadow-lg"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Image with overlay badges */}
        {event.imageUrl && (
          <div className="relative w-full h-72 bg-muted overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isLive && (
                <Badge className="bg-red-500 text-white font-semibold gap-1.5 px-3 shadow-lg animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                  <span className="w-2 h-2 bg-white rounded-full" />
                  LIVE
                </Badge>
              )}
              {event.isFree && !isSoldOut && (
                <Badge className="bg-green-500 text-white font-semibold px-3 shadow-lg">
                  Free
                </Badge>
              )}
              {isSoldOut && (
                <Badge className="bg-gray-900 text-white font-semibold px-3 shadow-lg">
                  Sold Out
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-5">
          {/* Title & Organizer */}
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">{event.title}</h2>
            {event.organizer && (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-primary/10">
                  {event.organizer.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 font-medium">Hosted by</p>
                  <p className="text-sm font-semibold text-foreground">
                    {event.organizer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Time & Location - Premium cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 hover:border-border transition-colors">
              <div className="w-11 h-11 rounded-xl bg-background shadow-sm flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 text-sm">
                <p className="font-bold text-foreground mb-1">
                  {event.startTime}
                </p>
                <p className="text-xs text-muted-foreground/80">October 22, 2025</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 hover:border-border transition-colors">
              <div className="w-11 h-11 rounded-xl bg-background shadow-sm flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 text-sm">
                <p className="font-bold text-foreground line-clamp-1 mb-1">{event.venue}</p>
                {event.address && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-1">{event.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Attendees - only show if > 0 */}
          {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {event.attendeeCount} {event.attendeeCount === 1 ? 'person' : 'people'} going
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2 space-y-2.5">
              <h3 className="font-bold text-sm text-foreground/90 uppercase tracking-wide">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-6">
            <Button className="rounded-full shadow-md hover:shadow-lg transition-shadow font-semibold" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Add to calendar
            </Button>
            <Button variant="outline" className="rounded-full font-semibold border-2 hover:bg-muted/50" size="lg">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Secondary actions */}
          {event.url && (
            <Button variant="ghost" className="w-full rounded-full text-muted-foreground hover:text-foreground" size="sm" asChild>
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                View event details
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
