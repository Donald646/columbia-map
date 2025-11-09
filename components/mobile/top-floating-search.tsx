'use client'

import { LocationSearch } from '@/components/location-search'

interface TopFloatingSearchProps {
  onLocationSelect: (longitude: number, latitude: number, placeName: string) => void
}

export function TopFloatingSearch({ onLocationSelect }: TopFloatingSearchProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-30">
      <div className="bg-background rounded-full shadow-lg px-4 py-3">
        <LocationSearch
          onLocationSelect={onLocationSelect}
          placeholder="Search location..."
        />
      </div>
    </div>
  )
}
