'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { LocationSearch } from '@/components/forms/location-search'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DiningHall {
  id: string
  name: string
  slug: string
  address: string | null
  latitude: number
  longitude: number
  image_url: string | null
  description: string | null
  external_id: string | null
  active: boolean
  school_id: string
  schools?: {
    id: string
    name: string
    slug: string
  }
}

interface School {
  id: string
  name: string
  slug: string
}

interface DiningHallEditFormProps {
  diningHall: DiningHall
  schools: School[]
}

export default function DiningHallEditForm({ diningHall, schools }: DiningHallEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: diningHall.name,
    slug: diningHall.slug,
    school_id: diningHall.school_id,
    address: diningHall.address || '',
    latitude: diningHall.latitude,
    longitude: diningHall.longitude,
    image_url: diningHall.image_url || '',
    description: diningHall.description || '',
    external_id: diningHall.external_id || '',
    active: diningHall.active,
  })

  const handleLocationChange = (location: {
    venue_name: string
    venue_address: string
    latitude: number
    longitude: number
  }) => {
    setFormData({
      ...formData,
      name: location.venue_name,
      address: location.venue_address,
      latitude: location.latitude,
      longitude: location.longitude,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('dining_halls')
        .update({
          name: formData.name,
          slug: formData.slug,
          school_id: formData.school_id,
          address: formData.address || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_url: formData.image_url || null,
          description: formData.description || null,
          external_id: formData.external_id || null,
          active: formData.active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', diningHall.id)

      if (updateError) throw updateError

      router.push(`/superadmin/dining-halls/${diningHall.id}`)
      router.refresh()
    } catch (err) {
      console.error('Error updating dining hall:', err)
      setError(err instanceof Error ? err.message : 'Failed to update dining hall')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link href={`/superadmin/dining-halls/${diningHall.id}`}>
        <Button type="button" variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </Link>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* School Selection */}
            <div>
              <Label htmlFor="school_id">School *</Label>
              <Select
                value={formData.school_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, school_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
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

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive dining halls won&apos;t appear on the map
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold">Location Details</h2>

        {/* Location Search */}
        <LocationSearch
          value={formData.name}
          onChange={handleLocationChange}
          required
          schoolId={schools.find((s) => s.id === formData.school_id)?.slug}
        />

        {/* Manual Override Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="John Jay Dining Hall"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
              placeholder="john-jay"
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="1230 Amsterdam Ave, New York, NY 10027"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: parseFloat(e.target.value) })
              }
              required
              placeholder="40.805823"
            />
          </div>

          <div>
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: parseFloat(e.target.value) })
              }
              required
              placeholder="-73.962547"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold">Additional Details</h2>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Main dining hall serving breakfast, lunch, and dinner..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <Label htmlFor="external_id">External API ID</Label>
          <Input
            id="external_id"
            value={formData.external_id}
            onChange={(e) =>
              setFormData({ ...formData, external_id: e.target.value })
            }
            placeholder="10"
          />
          <p className="text-xs text-muted-foreground mt-1">
            ID from Columbia Dining API (if applicable)
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Link href={`/superadmin/dining-halls/${diningHall.id}`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
