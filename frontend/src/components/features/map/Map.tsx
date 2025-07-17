'use client'

import type { MapItems } from '~/types/map'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapTilerLayer from './layers/MapTilerLayer'
import MidpointMarker from './markers/MidpointMarker'
import RestaurantMarker from './markers/RestaurantMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  apiKey,
  midpoint,
  restaurants,
}: MapItems) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const mapOptions = createLeafletOptions(midpoint, isMobile)

  return (
    <main className="relative z-40 size-full overflow-hidden">
      <MapContainer
        center={midpoint}
        {...mapOptions}
        className="absolute size-full"
      >
        {apiKey
          && (
            <MapTilerLayer
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
