'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSchool } from '@/lib/school-context'

interface LocationResult {
  id: string
  place_name: string
  center: [number, number]
  text: string
}

interface LocationSearchProps {
  onLocationSelect?: (longitude: number, latitude: number, placeName: string) => void
  className?: string
  placeholder?: string
}

export function LocationSearch({ onLocationSelect, className, placeholder = 'Search location...' }: LocationSearchProps) {
  const school = useSchool()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const searchLocation = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    try {
      // Use Search Box API /suggest for POI search
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&access_token=${token}` +
        `&session_token=${Date.now()}` +
        `&proximity=${school.mapCenter.longitude},${school.mapCenter.latitude}` +
        `&limit=10` +
        `&language=en` +
        `&types=poi,address,place`
      )

      const data = await response.json()

      // Convert suggestions to our format
      interface MapboxSuggestion {
        mapbox_id: string
        name: string
        full_address?: string
        place_formatted?: string
      }
      const suggestions = (data.suggestions || []).map((item: MapboxSuggestion) => ({
        id: item.mapbox_id,
        place_name: item.full_address || item.place_formatted || item.name,
        center: [0, 0], // Will get real coords on retrieve
        text: item.name,
      }))
      
      setResults(suggestions)
      setShowResults(true)
    } catch (error) {
      console.error('Geocoding error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [school])

  const handleInputChange = (value: string) => {
    setQuery(value)

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchLocation(value)
    }, 300)
  }

  const handleSelectLocation = async (result: LocationResult) => {
    setQuery(result.text)
    setShowResults(false)
    
    // Step 2: Retrieve full details with coordinates using mapbox_id
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.id}?` +
        `access_token=${token}` +
        `&session_token=${Date.now()}`
      )
      
      const data = await response.json()
      const feature = data.features?.[0]
      
      if (feature?.geometry?.coordinates) {
        const [longitude, latitude] = feature.geometry.coordinates
        onLocationSelect?.(longitude, latitude, result.place_name)
      }
    } catch (error) {
      console.error('Error retrieving location details:', error)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectLocation(result)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{result.text}</p>
                <p className="text-xs text-muted-foreground truncate">{result.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      )}
    </div>
  )
}

