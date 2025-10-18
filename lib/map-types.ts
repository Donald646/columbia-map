export interface MapCenter {
  longitude: number
  latitude: number
}

export interface MapBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface MapMarker {
  id: string
  longitude: number
  latitude: number
  title: string
  category?: string
  color?: string
}

export interface MapConfig {
  center: MapCenter
  zoom: number
  style?: string
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

export interface IMapProvider {
  onMarkerClick?: (markerId: string) => void
  onBoundsChange?: (bounds: MapBounds) => void
  markers: MapMarker[]
  initialCenter: MapCenter
  initialZoom: number
  initialBearing?: number
  userLocation?: { longitude: number; latitude: number } | null
  onFlyTo?: (longitude: number, latitude: number) => void
}

