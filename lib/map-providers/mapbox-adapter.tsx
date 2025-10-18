'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox'
import { IMapProvider, MapBounds, MapViewState } from '../map-types'
import 'mapbox-gl/dist/mapbox-gl.css'

export function MapboxAdapter({
  markers,
  initialCenter,
  initialZoom,
  onMarkerClick,
  onBoundsChange,
  userLocation,
  onFlyTo,
  initialBearing = 0,
}: IMapProvider) {
  const mapRef = useRef<MapRef>(null)

  // Expose flyTo functionality
  useEffect(() => {
    if (onFlyTo) {
      const flyToLocation = (longitude: number, latitude: number) => {
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1500,
          essential: true,
        })
      }
      
      ;(window as any).__mapFlyTo = flyToLocation
    }
  }, [onFlyTo])

  const [viewState, setViewState] = React.useState<MapViewState>({
    longitude: initialCenter.longitude,
    latitude: initialCenter.latitude,
    zoom: initialZoom,
    pitch: 0,
    bearing: initialBearing,
  })

  const [showRecenter, setShowRecenter] = useState(false)

  const handleMoveEnd = useCallback(() => {
    if (mapRef.current && onBoundsChange) {
      const bounds = mapRef.current.getBounds()
      if (bounds) {
        onBoundsChange({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        })
      }
    }
  }, [onBoundsChange])

  const handleRecenter = useCallback(() => {
    setViewState({
      longitude: initialCenter.longitude,
      latitude: initialCenter.latitude,
      zoom: initialZoom,
      pitch: 0,
      bearing: initialBearing || 0,
    })
  }, [initialCenter, initialZoom, initialBearing])

  // Check if user is off-center to show/hide recenter button
  useEffect(() => {
    const lngDiff = Math.abs(viewState.longitude - initialCenter.longitude)
    const latDiff = Math.abs(viewState.latitude - initialCenter.latitude)
    const bearingDiff = Math.abs((viewState.bearing || 0) - (initialBearing || 0))
    
    const isOffCenter = 
      lngDiff > 0.005 || 
      latDiff > 0.005 || 
      viewState.zoom < 14 ||
      bearingDiff > 5
    
    setShowRecenter(isOffCenter)
  }, [viewState, initialCenter, initialBearing])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      onMoveEnd={handleMoveEnd}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={mapboxToken}
      style={{ width: '100%', height: '100%' }}
      maxPitch={0}
      minPitch={0}
      dragRotate={true}
    >
      <NavigationControl position="top-right" showCompass={true} />
      
      {/* Recenter button - only show when off-center */}
      {showRecenter && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleRecenter}
            className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 md:px-4 rounded-md shadow-md border border-gray-200 transition-all flex items-center gap-2"
            title="Return to Campus"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      )}
      
      {markers.map((marker) => {
        const isUserLocation = marker.id === 'user-location'
        
        return (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              if (!isUserLocation) {
                onMarkerClick?.(marker.id)
              }
            }}
          >
            {isUserLocation ? (
              <div className="relative">
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    border: '3px solid white',
                    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            ) : (
              <div
                className="cursor-pointer transition-transform hover:scale-110"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: marker.color || '#1E40AF',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </Marker>
        )
      })}
    </Map>
  )
}

