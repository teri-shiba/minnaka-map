'use client'

import type { MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { calculateCardPosition } from '~/utils/calculate-card-position'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapContent from './MapContent'
import MapRestaurantCard from './MapRestaurantCard'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

interface CardPosition {
  left: number
  top: number
}

export default function Map({ apiKey, midpoint, restaurants }: MapItems) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null)
  const [mapData, setMapData] = useState<{
    pinPosition: { x: number, y: number } | null
    mapCenter: { x: number, y: number } | null
    mapSize: { width: number, height: number } | null
  }>({ pinPosition: null, mapCenter: null, mapSize: null })

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setSelectedRestaurant(null)
    })
    return () => cancelAnimationFrame(raf)
  }, [restaurants])

  const cardPosition = useMemo<CardPosition | null>(() => {
    if (!selectedRestaurant || !mapData.pinPosition || !mapData.mapCenter) {
      return null
    }

    return calculateCardPosition({
      pinPosition: mapData.pinPosition,
      mapCenter: mapData.mapCenter,
    })
  }, [selectedRestaurant, mapData.pinPosition, mapData.mapCenter])

  const mapOptions = createLeafletOptions(midpoint)

  return (
    <main className="relative z-40 size-full overflow-hidden">
      <MapContainer
        center={midpoint}
        {...mapOptions}
        className="absolute size-full"
      >
        <MapContent
          apiKey={apiKey}
          midpoint={midpoint}
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onRestaurantClick={setSelectedRestaurant}
          onRestaurantClose={() => {
            setSelectedRestaurant(null)
          }}
          onPinPositionChange={setMapData}
        />
      </MapContainer>

      {cardPosition && (
        <div
          className="absolute z-[999] hidden w-60 overflow-hidden rounded-2xl md:block"
          style={{
            left: cardPosition.left,
            top: cardPosition.top,
          }}
        >
          <MapRestaurantCard
            restaurant={selectedRestaurant!}
            onClose={() => setSelectedRestaurant(null)}
          />
        </div>
      )}

      {selectedRestaurant && (
        <div className="absolute inset-x-0 bottom-8 z-[999] mx-auto w-11/12 max-w-96 overflow-hidden rounded-2xl  md:hidden">
          <MapRestaurantCard
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        </div>
      )}
    </main>
  )
}
