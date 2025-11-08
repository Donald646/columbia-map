'use client'

import React from 'react'
import { MapPin, Clock, Tag, Users, ExternalLink, Plus, Share2, Calendar, Navigation } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  }
}

const categoryGradients = {
  academic: 'from-blue-500 to-blue-600',
  social: 'from-purple-500 to-pink-600',
  career: 'from-green-500 to-emerald-600',
  arts: 'from-orange-500 to-red-600',
  sports: 'from-yellow-500 to-amber-600',
  service: 'from-teal-500 to-cyan-600',
  other: 'from-gray-500 to-slate-600',
}

export function EventDetailModalPremium({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!event) return null

  const gradient = categoryGradients[event.category as keyof typeof categoryGradients] || categoryGradients.other

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Hero Image Section */}
        <div className="relative h-48 overflow-hidden">
          {event.imageUrl ? (
            <>
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </>
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', gradient)}>
              <div className="absolute inset-0 bg-grid-white/[0.1]" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm border-0 text-sm font-medium"
            >
              {event.category}
            </Badge>
          </div>

          {/* Free Badge */}
          {event.isFree && (
            <div className="absolute top-4 right-4">
              <Badge
                variant="secondary"
                className="bg-green-500/90 text-white backdrop-blur-sm border-0 text-sm font-medium"
              >
                Free
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(90vh-12rem)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold leading-tight pr-8">{event.title}</DialogTitle>
            {event.organizer && (
              <DialogDescription className="flex items-center gap-2 pt-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {event.organizer.charAt(0)}
                </div>
                <span className="text-sm">By {event.organizer}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">Time</p>
                <p className="font-semibold text-sm">
                  {event.startTime}
                  {event.endTime && ` - ${event.endTime}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Friday, Oct 21</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">Location</p>
                <p className="font-semibold text-sm line-clamp-1">{event.venue}</p>
                {event.address && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Attendees */}
          {event.attendeeCount && event.attendeeCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border-0">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">{event.attendeeCount} people attending</p>
                <p className="text-xs text-muted-foreground">Join them at this event</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">About</h3>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <Button className="gap-2 font-medium shadow-sm" size="lg">
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </Button>
            <Button variant="outline" className="gap-2 font-medium" size="lg">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2 text-sm" size="sm">
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
            {event.url && (
              <Button variant="outline" className="gap-2 text-sm" size="sm" asChild>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Event Page
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
