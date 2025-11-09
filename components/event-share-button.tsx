'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EventShareButtonProps {
  eventId: string
  eventTitle: string
  schoolSlug: string
  variant?: 'default' | 'outline'
  className?: string
}

export function EventShareButton({
  eventId,
  eventTitle,
  schoolSlug,
  variant = 'outline',
  className
}: EventShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${schoolSlug}/events/${eventId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
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

  return (
    <Button
      variant={variant}
      size="lg"
      className={className}
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )
}
