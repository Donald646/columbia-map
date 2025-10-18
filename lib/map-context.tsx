'use client'

import React, { createContext, useContext } from 'react'

type MapProviderType = 'mapbox' | 'google'

interface MapContextValue {
  provider: MapProviderType
  setProvider: (provider: MapProviderType) => void
}

const MapContext = createContext<MapContextValue>({
  provider: 'mapbox',
  setProvider: () => {},
})

export function MapProviderContext({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = React.useState<MapProviderType>('mapbox')

  return (
    <MapContext.Provider value={{ provider, setProvider }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapProvider() {
  return useContext(MapContext)
}


