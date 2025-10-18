'use client'

import React from 'react'
import { MapboxAdapter } from '@/lib/map-providers/mapbox-adapter'
import { MapMarker } from '@/lib/map-types'
import { useSchool } from '@/lib/school-context'

interface MapViewProps {
  markers?: MapMarker[]
  onMarkerClick?: (markerId: string) => void
  onBoundsChange?: (bounds: any) => void
  userLocation?: { longitude: number; latitude: number } | null
  onFlyTo?: (longitude: number, latitude: number) => void
}

export function MapView({ markers = [], onMarkerClick, onBoundsChange, userLocation, onFlyTo }: MapViewProps) {
  const school = useSchool()
  const allMarkers = userLocation
    ? [
        ...markers,
        {
          id: 'user-location',
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
          title: 'Your Location',
          category: 'user',
          color: school.primaryColor,
        },
      ]
    : markers

  return (
    <div className="h-full w-full">
      <MapboxAdapter
        markers={allMarkers}
        initialCenter={school.mapCenter}
        initialZoom={school.mapZoom}
        initialBearing={school.mapBearing}
        onMarkerClick={onMarkerClick}
        onBoundsChange={onBoundsChange}
        userLocation={userLocation}
        onFlyTo={onFlyTo}
      />
    </div>
  )
}

