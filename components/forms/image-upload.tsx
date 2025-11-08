'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
  label: string
  value?: string | null
  onChange: (url: string | null) => void
  bucket: 'event-images' | 'organization-logos'
  folder: string // e.g., event ID or organization ID
  aspectRatio?: string // e.g., "16/9" or "1/1"
  maxSizeMB?: number
  required?: boolean
  description?: string
}

export function ImageUpload({
  label,
  value,
  onChange,
  bucket,
  folder,
  aspectRatio = '16/9',
  maxSizeMB = 5,
  required = false,
  description
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Image must be less than ${maxSizeMB}MB`)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload image: ${error.message}`)
      setPreview(value || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      // Extract file path from URL
      const url = new URL(value)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === bucket)
      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      // Delete from storage
      await supabase.storage.from(bucket).remove([filePath])

      onChange(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Image removed')
    } catch (error: any) {
      console.error('Remove error:', error)
      toast.error('Failed to remove image')
    }
  }

  const aspectRatioClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]'
  }[aspectRatio] || 'aspect-video'

  return (
    <div>
      <Label className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="space-y-3">
        {/* Preview or Upload Area */}
        {preview ? (
          <div className="relative group">
            <div className={`${aspectRatioClass} w-full overflow-hidden rounded-lg border bg-muted`}>
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shadow-lg"
              >
                <Upload className="w-4 h-4 mr-1" />
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={uploading}
                className="shadow-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed rounded-lg hover:border-primary hover:bg-accent/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed py-8"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs">Recommended ratio: {aspectRatio}</p>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
