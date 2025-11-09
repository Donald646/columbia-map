'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { DbOrganization } from '@/types/database-helpers'

interface OrganizationFormProps {
  schools: { id: string; name: string }[]
  organization?: DbOrganization
  redirectUrl?: string
  showVerifiedToggle?: boolean // Super admin only
  showSchoolSelector?: boolean // Super admin can change school, org admin cannot
  showSlugField?: boolean // Super admin only
}

export function OrganizationForm({
  schools,
  organization,
  redirectUrl,
  showVerifiedToggle = false,
  showSchoolSelector = false,
  showSlugField = false
}: OrganizationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const uploadFolder = useMemo(() => {
    return organization?.id || `temp-${Date.now()}`
  }, [organization?.id])

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    slug: organization?.slug || '',
    description: organization?.description || '',
    school_id: organization?.school_id || schools[0]?.id || '',
    logo_url: organization?.logo_url || null,
    banner_url: organization?.banner_url || null,
    website_url: organization?.website_url || '',
    mailing_list_url: organization?.mailing_list_url || '',
    verified: organization?.verified ?? false,
  })

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Image must be less than ${type === 'logo' ? '2MB' : '5MB'}`)
      return
    }

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner
    setUploading(true)

    try {
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
      const filePath = `${uploadFolder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath)

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_url']: publicUrl
      }))

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const orgData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || null,
        school_id: formData.school_id,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        website_url: formData.website_url || null,
        mailing_list_url: formData.mailing_list_url || null,
        ...(showVerifiedToggle && { verified: formData.verified }),
        status: 'active',
      }

      if (organization?.id) {
        // Update
        const { error } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', organization.id)
          .select()

        if (error) {
          throw new Error(error.message || 'Failed to update organization')
        }

        toast.success('Organization updated successfully!')
      } else {
        // Create
        const { error } = await supabase
          .from('organizations')
          .insert(orgData)
          .select()

        if (error) {
          throw new Error(error.message || 'Failed to create organization')
        }

        toast.success('Organization created successfully!')
      }

      router.push(redirectUrl || '/admin/settings')
      router.refresh()
    } catch (error) {
      console.error('Error saving organization:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to save organization: ${errorMessage}`)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* BANNER (Full-width Hero) */}
      <div className="relative mb-16">
        <div
          className="relative w-full h-64 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => bannerInputRef.current?.click()}
        >
          {formData.banner_url ? (
            <Image src={formData.banner_url} alt="Banner" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}

          {/* Change Cover Button */}
          <div className="absolute top-4 right-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                bannerInputRef.current?.click()
              }}
              disabled={uploadingBanner}
              className="shadow-lg"
            >
              {uploadingBanner ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Change Cover'
              )}
            </Button>
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'banner')}
            className="hidden"
          />
        </div>

        {/* LOGO (Overlaps Banner Bottom-Left) */}
        <div className="absolute -bottom-12 left-8">
          <div
            className="relative w-24 h-24 bg-background border-4 border-background rounded-2xl overflow-hidden cursor-pointer group shadow-xl"
            onClick={() => logoInputRef.current?.click()}
          >
            {formData.logo_url ? (
              <Image src={formData.logo_url} alt="Logo" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Camera className="w-8 h-8 text-muted-foreground/30" />
              </div>
            )}

            {/* Small Edit Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingLogo ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </div>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* FORM FIELDS (Single Column, Compact) */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Organization Name</label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter organization name"
          />
        </div>

        {showSchoolSelector && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">School</label>
            <Select
              required
              value={formData.school_id}
              onValueChange={(value) => setFormData({ ...formData, school_id: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showSlugField && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Slug</label>
            <Input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated"
              className="h-9"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add a short description..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Website</label>
          <Input
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="https://example.com"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Mailing List URL</label>
          <Input
            type="url"
            value={formData.mailing_list_url}
            onChange={(e) => setFormData({ ...formData, mailing_list_url: e.target.value })}
            placeholder="https://forms.gle/..."
            className="h-9"
          />
        </div>

        {showVerifiedToggle && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Settings</h3>
            <div className="flex items-center gap-3">
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
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {organization?.id ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  )
}
