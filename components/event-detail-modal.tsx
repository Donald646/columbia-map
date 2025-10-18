'use client'

import React from 'react'
import { MapPin, Clock, Tag, Users, ExternalLink, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  }
}

export function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
          {event.organizer && (
            <DialogDescription className="flex items-center gap-2 pt-2">
              <Users className="w-4 h-4" />
              <span>{event.organizer}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Time & Date */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Friday, October 10, 2025</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{event.venue}</p>
              {event.address && (
                <p className="text-sm text-muted-foreground mt-1">{event.address}</p>
              )}
            </div>
          </div>

          {/* Category & Price */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <Badge>{event.category}</Badge>
            </div>
            {event.isFree && (
              <Badge variant="secondary">
                Free
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">About this event</h3>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Add to Calendar
            </Button>
            {event.url && (
              <Button variant="outline" className="flex-1 gap-2">
                <ExternalLink className="w-4 h-4" />
                Open RSVP
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

