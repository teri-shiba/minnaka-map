'use client'

import type { MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useState } from 'react'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapTilerLayer from './layers/MapTilerLayer'
import MapRestaurantCard from './MapRestaurantCard'
import MidpointMarker from './markers/MidpointMarker'
import RestaurantMarker from './markers/RestaurantMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  apiKey,
  midpoint,
  restaurants,
}: MapItems) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null)
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
            <MapTilerLayer
              apiKey={apiKey}
            />
          )}
        <ZoomControl position="topright" />
        <MidpointMarker position={midpoint} />
        <RestaurantMarker
          restaurants={restaurants}
          onRestaurantClick={setSelectedRestaurant}
        />
      </MapContainer>

      {selectedRestaurant && (
        <div className="absolute inset-x-0 mx-auto bottom-8 z-[999] w-11/12 max-w-96 overflow-hidden rounded-2xl  md:right-10 md:w-60">
          <MapRestaurantCard
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        </div>
      )}
    </main>
  )
}
