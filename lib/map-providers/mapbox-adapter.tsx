'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox'
import { IMapProvider, MapBounds, MapViewState } from '../map-types'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
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

  // Expose viewState to window for mobile recenter button
  useEffect(() => {
    ;(window as any).__mapViewState = viewState
  }, [viewState])

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
      <NavigationControl position="top-right" showCompass={false} showZoom={false} />
      
      {/* Recenter button - only show when off-center and on desktop */}
      {showRecenter && (
        <div className="hidden lg:block absolute top-4 left-4 z-10">
          <Button
            onClick={handleRecenter}
            variant="secondary"
            size="sm"
            className="shadow-lg gap-2 rounded-full"
            title="Return to Campus"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Recenter</span>
          </Button>
        </div>
      )}
      
      {markers.map((marker, index) => {
        const isUserLocation = marker.id === 'user-location'

        // Color coding: school events = blue, club events = orange
        const markerColor = marker.type === 'school'
          ? '#1E40AF'  // School blue
          : '#F97316'   // Club orange

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
                {/* Pulsing outer ring */}
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-500/20 animate-ping" />
                {/* Main dot */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    border: '3px solid white',
                    boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.3), 0 6px 12px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            ) : (
              <div
                className="cursor-pointer group relative"
                style={{
                  animation: `markerPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.05}s backwards`
                }}
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    filter: 'blur(8px)',
                    background: markerColor,
                    transform: 'scale(1.2)',
                  }}
                />

                {/* Main marker SVG */}
                <svg
                  width="36"
                  height="44"
                  viewBox="0 0 36 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-lg"
                >
                  {/* Shadow */}
                  <ellipse
                    cx="18"
                    cy="42"
                    rx="6"
                    ry="2"
                    fill="black"
                    opacity="0.2"
                    className="group-hover:opacity-30 transition-opacity"
                  />

                  {/* Pin shape with gradient */}
                  <defs>
                    <linearGradient id={`gradient-${marker.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={markerColor} stopOpacity="1" />
                      <stop offset="100%" stopColor={markerColor} stopOpacity="0.85" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M18 2C9.716 2 3 8.716 3 17c0 12.5 15 23 15 23s15-10.5 15-23c0-8.284-6.716-15-15-15z"
                    fill={`url(#gradient-${marker.id})`}
                    stroke="white"
                    strokeWidth="3"
                    className="group-hover:stroke-2"
                  />

                  {/* Inner dot */}
                  <circle
                    cx="18"
                    cy="17"
                    r="6"
                    fill="white"
                    opacity="0.95"
                    className="group-hover:r-7 transition-all"
                  />

                  {/* Center dot */}
                  <circle
                    cx="18"
                    cy="17"
                    r="3"
                    fill={markerColor}
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}
          </Marker>
        )
      })}
    </Map>
  )
}

