/**
 * EventForm Component
 *
 * A Luma-inspired event creation/editing form with:
 * - Two-column layout: image preview + form fields
 * - Image upload with camera button overlay
 * - Expandable description and location fields
 * - Calendar-based date/time pickers
 * - Public/Private visibility toggle
 *
 * The form supports both creating new events and editing existing ones.
 */

'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, MapPin, FileText, Globe } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { createClient } from '@/utils/supabase/client'
import { LocationSearch } from './location-search'

interface EventFormProps {
  organizationId: string
  organizationName: string
  schoolId: string
  schoolSlug?: string
  event?: any
  redirectUrl: string
}

export function EventForm({
  organizationId,
  organizationName,
  schoolId,
  schoolSlug,
  event,
  redirectUrl
}: EventFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // UI toggle states
  const [showDescription, setShowDescription] = useState(!!event?.description)
  const [showLocation, setShowLocation] = useState(!!event?.venue_name)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Upload folder structure: organization_id/event_id
  const uploadFolder = useMemo(() => {
    const eventFolder = event?.id || `new-${Date.now()}`
    return `${organizationId}/${eventFolder}`
  }, [event?.id, organizationId])

  // Form data state
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    venue_name: event?.venue_name || '',
    venue_address: event?.venue_address || '',
    latitude: event?.latitude || 0,
    longitude: event?.longitude || 0,
    is_free: event?.is_free ?? true,
    image_url: event?.image_url || null,
    external_url: event?.external_url || '',
    status: event?.status || 'published',
  })

  // Date states
  const [startsAt, setStartsAt] = useState<Date | undefined>(
    event?.starts_at ? new Date(event.starts_at) : undefined
  )
  const [endsAt, setEndsAt] = useState<Date | undefined>(
    event?.ends_at ? new Date(event.ends_at) : undefined
  )

  // Utility function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handler: Location selection
  const handleLocationSelect = (location: any) => {
    setFormData(prev => ({
      ...prev,
      venue_name: location.venue_name,
      venue_address: location.venue_address,
      latitude: location.latitude,
      longitude: location.longitude
    }))
  }

  // Handler: Image upload trigger
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Handler: Image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
      const filePath = `${uploadFolder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath)

      updateField('image_url', publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handler: Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Event title is required')
        setLoading(false)
        return
      }

      if (!startsAt) {
        toast.error('Start date and time is required')
        setLoading(false)
        return
      }

      // Validate that start date is not in the past
      const now = new Date()
      if (startsAt < now) {
        toast.error('Start date cannot be in the past')
        setLoading(false)
        return
      }

      // Validate that end date is after start date
      if (endsAt && endsAt < startsAt) {
        toast.error('End date must be after start date')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Prepare event data for database
      const eventData = {
        organization_id: organizationId,
        school_id: schoolId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt?.toISOString() || null,
        venue_name: formData.venue_name?.trim() || null,
        venue_address: formData.venue_address?.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        category: 'social',
        is_free: formData.is_free,
        image_url: formData.image_url || null,
        external_url: formData.external_url?.trim() || null,
        status: formData.status,
      }

      // Update or create event
      if (event?.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)

        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message || 'Failed to update event')
        }
        toast.success('Event updated successfully!')
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)

        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message || 'Failed to create event')
        }
        toast.success('Event created successfully!')
      }

      // Navigate back to redirect URL
      router.push(redirectUrl)
      router.refresh()
    } catch (error: any) {
      console.error('Error saving event:', error)
      toast.error(error.message || 'Failed to save event. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ===== LEFT COLUMN: Image Upload ===== */}
        <div
          className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {formData.image_url ? (
            <Image
              src={formData.image_url}
              alt="Event cover"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Click to add event photo</p>
              </div>
            </div>
          )}

          {/* Camera Button Overlay */}
          <div className="absolute bottom-4 right-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleImageClick()
              }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* ===== RIGHT COLUMN: Form Fields ===== */}
        <div className="space-y-6">
          {/* Organization Name Display */}
          <p className="text-sm text-muted-foreground">{organizationName}</p>

          {/* Event Title Input */}
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Event Name"
            required
            className="text-2xl font-semibold border-0 px-3 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 bg-muted/30 rounded-lg"
          />

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <DateTimePicker
              label="Start"
              date={startsAt}
              setDate={setStartsAt}
              required
            />

            <DateTimePicker
              label="End"
              date={endsAt}
              setDate={setEndsAt}
            />
          </div>

          {/* Event Location - Expandable */}
          <div className="space-y-2">
            {!formData.venue_name ? (
              <>
                {!showLocation ? (
                  <button
                    type="button"
                    onClick={() => setShowLocation(true)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Add Event Location</span>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-5 h-5" />
                      <span>Add Event Location</span>
                    </div>
                    <LocationSearch
                      value={formData.venue_name}
                      onChange={handleLocationSelect}
                      schoolId={schoolSlug}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{formData.venue_name}</p>
                  {formData.venue_address && (
                    <p className="text-sm text-muted-foreground">{formData.venue_address}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      updateField('venue_name', '')
                      updateField('venue_address', '')
                      setShowLocation(true)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1"
                  >
                    Change location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Event Description - Expandable */}
          <div className="space-y-2">
            {!showDescription && !isEditingDescription ? (
              <button
                type="button"
                onClick={() => {
                  setShowDescription(true)
                  setIsEditingDescription(true)
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <FileText className="w-5 h-5" />
                <span>Add Description</span>
              </button>
            ) : isEditingDescription ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <FileText className="w-5 h-5" />
                  <span>Event Description</span>
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  onBlur={() => {
                    if (formData.description) {
                      setIsEditingDescription(false)
                    }
                  }}
                  placeholder="Tell people what your event is about..."
                  rows={4}
                  className="resize-none"
                  autoFocus
                />
              </div>
            ) : formData.description ? (
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{formData.description}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingDescription(true)}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1"
                  >
                    Edit description
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Event Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Event Options</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                <span>Visibility</span>
              </div>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
              >
                <option value="published">Public</option>
                <option value="draft">Private</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {event?.id ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </form>
  )
}
