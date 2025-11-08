'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Loader2, X } from 'lucide-react'

interface LocationResult {
  id: string
  place_name: string
  center: [number, number]
  text: string
}

interface LocationSearchProps {
  value: string
  onChange: (location: {
    venue_name: string
    venue_address: string
    latitude: number
    longitude: number
  }) => void
  required?: boolean
  schoolId?: string
}

// School coordinates for proximity bias
const SCHOOL_COORDS: { [key: string]: { lat: number; lng: number } } = {
  'columbia': { lat: 40.8075, lng: -73.9626 },
  'nyu': { lat: 40.7295, lng: -73.9965 },
}

export function LocationSearch({ value, onChange, required, schoolId }: LocationSearchProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      // Get proximity coords based on school
      const coords = schoolId && SCHOOL_COORDS[schoolId]
        ? SCHOOL_COORDS[schoolId]
        : { lat: 40.7589, lng: -73.9851 } // Default to NYC

      // Use Mapbox Search Box API /suggest for POI search
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
        `&session_token=${Date.now()}` +
        `&proximity=${coords.lng},${coords.lat}` +
        `&limit=10` +
        `&language=en` +
        `&types=poi,address,place`
      )

      const data = await response.json()

      // Convert suggestions to our format
      const results = (data.suggestions || []).map((item: any) => ({
        id: item.mapbox_id,
        place_name: item.full_address || item.place_formatted || item.name,
        center: [0, 0], // Will get real coords on retrieve
        text: item.name,
      }))

      setSuggestions(results)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Location search error:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(newQuery)
    }, 300)
  }

  const handleSelectLocation = async (result: LocationResult) => {
    setQuery(result.text)
    setShowSuggestions(false)
    setLoading(true)

    // Step 2: Retrieve full details with coordinates using mapbox_id
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.id}?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
        `&session_token=${Date.now()}`
      )

      const data = await response.json()
      const feature = data.features?.[0]

      if (feature?.geometry?.coordinates) {
        const [longitude, latitude] = feature.geometry.coordinates

        onChange({
          venue_name: result.text,
          venue_address: result.place_name,
          latitude: latitude,
          longitude: longitude
        })
      }
    } catch (error) {
      console.error('Error retrieving location details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div ref={searchRef} className="relative">
      <Label htmlFor="location-search" className="mb-2 block">
        Venue Location {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="location-search"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search for venues, buildings, or addresses..."
          className="pl-10 pr-10"
          required={required}
        />
        {query && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelectLocation(result)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.text}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.place_name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        Search for venues, buildings, landmarks, or addresses
      </p>
    </div>
  )
}
