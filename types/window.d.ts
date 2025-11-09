// Window extensions for map functionality
interface Window {
  __mapFlyTo?: (longitude: number, latitude: number) => void
  __mapViewState?: {
    longitude: number
    latitude: number
    zoom: number
    bearing?: number
  }
}
