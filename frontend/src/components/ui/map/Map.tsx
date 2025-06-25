'use client'

import type { MapProps } from '~/types/map'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { createLeafletOptions } from '~/utils/createLeafletOptions'
import MapTailerLayer from './layers/MapTailerLayer'
import UserLocationMarker from './markers/UserLocationMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  apiKey,
  userLocation,
}: MapProps) {
  const mapOptions = createLeafletOptions(userLocation)

  return (
    <main className="relative z-40 size-full flex-1 overflow-hidden md:w-3/5">
      <MapContainer
        center={userLocation}
        {...mapOptions}
        className="absolute size-full"
      >
        {apiKey
          && (
            <MapTailerLayer
              apiKey={apiKey}
            />
          )}
        <ZoomControl position="bottomright" />
        <UserLocationMarker position={userLocation} />
      </MapContainer>
    </main>
  )
}
