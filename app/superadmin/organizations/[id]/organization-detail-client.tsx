'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, MapPin, Plus, Users, Settings as SettingsIcon, Camera, Loader2, Upload } from 'lucide-react'
import SuperAdminTeamManager from './super-admin-team-manager'
import { EventActions } from './event-actions'
import { DeleteOrganization } from './delete-organization'
import { formatDate, formatTime } from '@/lib/utils/transform'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OrganizationDetailClientProps {
  org: any
  admins: any[]
  allUsers: any[]
  events: any[]
}

type NavSection = 'events' | 'team' | 'settings'

export default function OrganizationDetailClient({
  org,
  admins,
  allUsers,
  events
}: OrganizationDetailClientProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<NavSection>('events')
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    description: org.description || '',
    website_url: org.website_url || '',
    mailing_list_url: org.mailing_list_url || '',
    verified: org.verified || false,
  })

  const navItems = [
    { id: 'events' as NavSection, label: 'Events', icon: Calendar },
    { id: 'team' as NavSection, label: 'Team', icon: Users },
    { id: 'settings' as NavSection, label: 'Settings', icon: SettingsIcon },
  ]

  const handleImageUpload = async (file: File, type: 'banner' | 'logo') => {
    try {
      const supabase = createClient()

      // Set loading state
      if (type === 'banner') setUploadingBanner(true)
      else setUploadingLogo(true)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${org.id}/${type}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName)

      // Update organization record
      const updateField = type === 'banner' ? 'banner_url' : 'logo_url'
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ [updateField]: publicUrl })
        .eq('id', org.id)

      if (updateError) throw updateError

      toast.success(`${type === 'banner' ? 'Banner' : 'Logo'} updated successfully`)
      router.refresh()
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Failed to upload ${type}: ${error.message}`)
    } finally {
      if (type === 'banner') setUploadingBanner(false)
      else setUploadingLogo(false)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      handleImageUpload(file, 'banner')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      handleImageUpload(file, 'logo')
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({
          description: formData.description || null,
          website_url: formData.website_url || null,
          mailing_list_url: formData.mailing_list_url || null,
          verified: formData.verified,
        })
        .eq('id', org.id)

      if (error) throw error

      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating organization:', error)
      toast.error(`Failed to update: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hidden file inputs */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerChange}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        className="hidden"
      />

      {/* BANNER HERO with Overlapping Logo */}
      <div className="mb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div
            className="relative w-full h-28 md:h-36 bg-muted/40 rounded-lg overflow-hidden border cursor-pointer group transition-all hover:border-primary/50"
            onClick={() => bannerInputRef.current?.click()}
          >
            {org.banner_url ? (
              <Image src={org.banner_url} alt="Banner" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted/30">
                <Camera className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}

            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              {uploadingBanner ? (
                <div className="bg-background/95 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Change Banner</span>
                </div>
              )}
            </div>
          </div>

          {/* LOGO (Overlaps Banner Bottom-Left) */}
          <div className="absolute -bottom-8 left-4 md:left-6">
            <div
              className="relative w-16 h-16 md:w-18 md:h-18 bg-background border-4 border-background rounded-lg overflow-hidden shadow-md cursor-pointer group transition-all hover:border-primary/50"
              onClick={() => logoInputRef.current?.click()}
            >
              {org.logo_url ? (
                <Image src={org.logo_url} alt="Logo" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/50 border border-border">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40" />
                </div>
              )}

              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Upload className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Name and Info */}
      <div className="px-4 md:px-6 mb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl md:text-2xl font-bold">{org.name}</h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              org.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {org.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{org.schools?.name}</p>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden px-4 mb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 border-b overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors text-sm whitespace-nowrap ${
                    isActive
                      ? 'border-foreground text-foreground font-medium'
                      : 'border-transparent text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-6">
        <div className="max-w-4xl mx-auto w-full h-full flex overflow-hidden">
        {/* Desktop Left Sidebar Navigation */}
        <div className="hidden md:block w-64 border-r pr-6 py-4 space-y-1 flex-shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto md:pl-6">
          <div className="pb-8">
          {activeSection === 'events' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Events</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/superadmin/organizations/${org.id}/events/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </div>

              {events && events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                event.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : event.status === 'draft'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(event.starts_at)} at {formatTime(event.starts_at)}
                              </span>
                            </div>

                            {event.venue_name && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{event.venue_name}</span>
                              </div>
                            )}

                            {event.rsvp_count > 0 && (
                              <div className="text-xs bg-muted px-2 py-0.5 rounded">
                                {event.rsvp_count} RSVPs
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <EventActions
                          eventId={event.id}
                          organizationId={org.id}
                          eventTitle={event.title}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="font-semibold mb-1">No events yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first event to get started
                  </p>
                  <Button asChild>
                    <Link href={`/superadmin/organizations/${org.id}/events/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Team Members</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage who can administrate this organization
                </p>
              </div>

              <SuperAdminTeamManager
                organizationId={org.id}
                admins={admins}
                allUsers={allUsers}
              />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a short description..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Mailing List URL
                  </label>
                  <Input
                    type="url"
                    value={formData.mailing_list_url}
                    onChange={(e) => setFormData({ ...formData, mailing_list_url: e.target.value })}
                    placeholder="https://forms.gle/..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="verified" className="text-sm">
                    Verified Organization
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deleting this organization will permanently remove all events, images, and related data. This action cannot be undone.
                </p>
                <DeleteOrganization organizationId={org.id} organizationName={org.name} />
              </div>
            </div>
          )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
