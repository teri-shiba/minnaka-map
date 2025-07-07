'use client'

import type { MapItems } from '~/types/map'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapTailerLayer from './layers/MapTailerLayer'
import MidpointMarker from './markers/MidpointMarker'
import RestaurantMarker from './markers/RestaurantMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  apiKey,
  midpoint,
  restaurants,
}: MapItems) {
  const mapOptions = createLeafletOptions(midpoint)

  return (
    <main className="relative z-40 size-full flex-1 overflow-hidden">
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
        <RestaurantMarker restaurants={restaurants} />
      </MapContainer>
    </main>
  )
}
