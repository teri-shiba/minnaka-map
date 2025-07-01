'use client'

import type { MapProps } from '~/types/map'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapTailerLayer from './layers/MapTailerLayer'
import MidpointMarker from './markers/MidPointMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  apiKey,
  midpoint,
}: MapProps) {
  const mapOptions = createLeafletOptions(midpoint)

  return (
    <main className="relative z-40 size-full flex-1 overflow-hidden md:w-3/5">
      <MapContainer
        center={midpoint}
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
        <MidpointMarker position={midpoint} />
      </MapContainer>
    </main>
  )
}
