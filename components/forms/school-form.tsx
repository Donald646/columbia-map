'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { Camera, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface SchoolFormProps {
  school?: any
  redirectUrl?: string
}

export function SchoolForm({ school, redirectUrl }: SchoolFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const uploadFolder = useMemo(() => {
    return school?.id || `temp-${Date.now()}`
  }, [school?.id])

  const [formData, setFormData] = useState({
    name: school?.name || '',
    slug: school?.slug || '',
    domain: school?.domain || '',
    location: school?.location || '',
    description: school?.description || '',
    logo_url: school?.logo_url || null,
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploadingLogo(true)

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
        logo_url: publicUrl
      }))

      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(`Failed to upload logo: ${error.message}`)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const schoolData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        domain: formData.domain || null,
        location: formData.location || null,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
      }

      if (school?.id) {
        // Update
        const { error } = await supabase
          .from('schools')
          .update(schoolData)
          .eq('id', school.id)

        if (error) throw new Error(error.message || 'Failed to update school')

        toast.success('School updated successfully!')
      } else {
        // Create
        const { error } = await supabase
          .from('schools')
          .insert(schoolData)

        if (error) throw new Error(error.message || 'Failed to create school')

        toast.success('School created successfully!')
      }

      router.push(redirectUrl || '/superadmin/schools')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving school:', error)
      const errorMessage = error?.message || error?.toString() || 'An unknown error occurred'
      toast.error(`Failed to save school: ${errorMessage}`)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* LOGO */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div
            className="relative w-32 h-32 bg-background border-4 border-background rounded-2xl overflow-hidden cursor-pointer group shadow-xl"
            onClick={() => logoInputRef.current?.click()}
          >
            {formData.logo_url ? (
              <Image src={formData.logo_url} alt="Logo" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Camera className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Click to upload school logo
        </p>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            School Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter school name"
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Slug <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="URL-friendly identifier (e.g., columbia)"
            className="h-9 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Used in URLs: hapmap.com/<span className="font-medium">{formData.slug || 'slug'}</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Email Domain
          </label>
          <Input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="columbia.edu"
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            Primary email domain for authentication
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Location
          </label>
          <Input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="New York, NY"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="A brief description of the school..."
            rows={3}
            className="resize-none"
          />
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {school?.id ? 'Update School' : 'Create School'}
        </Button>
      </div>
    </form>
  )
}
