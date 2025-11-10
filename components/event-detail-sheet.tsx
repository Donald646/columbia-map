'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Share2, ExternalLink, BadgeCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getGoogleMapsUrl, formatTime } from '@/lib/utils/transform'
import { DbEventWithOrg } from '@/types/database-helpers'
import { toast } from 'sonner'

interface EventDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  event?: DbEventWithOrg
  schoolSlug: string
}

export function EventDetailSheet({ isOpen, onClose, event, schoolSlug }: EventDetailSheetProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${schoolSlug}/events/${event?.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Event',
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
        toast.error('Failed to copy link')
      }
    }
  }

  if (!event) return null

  // Handle organizations being either an array or object from Supabase
  const organization = Array.isArray(event.organizations)
    ? event.organizations[0]
    : event.organizations

  // Map database event to component fields
  const mappedEvent = {
    title: event.title,
    description: event.description,
    imageUrl: event.image_url,
    startTime: formatTime(event.starts_at),
    endTime: event.ends_at ? formatTime(event.ends_at) : undefined,
    venue: event.venue_name || 'TBA',
    address: event.venue_address,
    category: event.category || 'other',
    organizer: organization?.name,
    organizerLogo: organization?.logo_url,
    isOrgVerified: organization?.verified,
    isFree: event.is_free ?? true,
    url: event.external_url,
    attendeeCount: event.rsvp_count || 0,
    longitude: event.longitude || 0,
    latitude: event.latitude || 0,
  }

  const isLive = false
  const isSoldOut = false

  const startDate = new Date(event.starts_at)
  const dateMonth = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const dateDay = startDate.getDate().toString()
  const fullDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const content = (
    <div className="w-full h-full overflow-y-auto">
      {/* Small Square Centered Image - Like Luma */}
      <div className="w-full bg-background pt-4 pb-3 flex justify-center">
        <div className="relative w-64 h-64 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden rounded-xl">
            {mappedEvent.imageUrl ? (
              <Image
                src={mappedEvent.imageUrl}
                alt={mappedEvent.title}
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
        <h1 className="text-2xl font-bold">{mappedEvent.title}</h1>

        {/* Hosted by */}
        {mappedEvent.organizer && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
              {mappedEvent.organizerLogo ? (
                <Image
                  src={mappedEvent.organizerLogo}
                  alt={mappedEvent.organizer}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              ) : (
                mappedEvent.organizer.charAt(0)
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">
                Hosted by {mappedEvent.organizer}
              </span>
              {mappedEvent.isOrgVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
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
                {fullDate}
              </div>
              <div className="text-xs text-muted-foreground">
                {mappedEvent.startTime} - {mappedEvent.endTime}
              </div>
            </div>
          </div>

          {/* Location */}
          {(() => {
            const mapsUrl = getGoogleMapsUrl(mappedEvent.latitude || 0, mappedEvent.longitude || 0, mappedEvent.venue)
            const LocationContent = (
              <>
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm line-clamp-1">{mappedEvent.venue}</div>
                  {mappedEvent.address && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{mappedEvent.address}</div>
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
        {mappedEvent.description && (
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mappedEvent.description}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full font-medium w-full"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Hosted By Section - NO BORDER */}
        <div className="pt-4">
          <h3 className="text-sm font-semibold mb-3">Hosted By</h3>
          {mappedEvent.organizer && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                {mappedEvent.organizerLogo ? (
                  <Image
                    src={mappedEvent.organizerLogo}
                    alt={mappedEvent.organizer}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  mappedEvent.organizer.charAt(0)
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="font-semibold text-sm">{mappedEvent.organizer}</div>
                {mappedEvent.isOrgVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Mobile: Use Drawer (full screen modal)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[95vh] p-0">
          <DrawerTitle className="sr-only">{mappedEvent.title}</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: Use Sheet (side panel)
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 overflow-y-auto"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
}
