'use client'

import type { CardPosition, MapData, MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { calculateCardPosition } from '~/utils/calculate-card-position'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapContent from './MapContent'
import MapRestaurantCard from './MapRestaurantCard'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({ apiKey, midpoint, restaurants }: MapItems) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null)
  const [mapData, setMapData] = useState<MapData>({
    pinPosition: null,
    mapCenter: null,
    mapSize: null,
  })

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSelectedRestaurant(null))
    return () => cancelAnimationFrame(raf)
  }, [restaurants])

  const handleRestaurantClick = useCallback(
    (restaurant: RestaurantListItem) => setSelectedRestaurant(restaurant),
    [],
  )

  const handleRestaurantClose = useCallback(() => setSelectedRestaurant(null), [])

  const handlePinPositionChange = setMapData

  const cardPosition = useMemo<CardPosition | null>(() => {
    if (!selectedRestaurant || !mapData.pinPosition || !mapData.mapCenter) {
      return null
    }

    return calculateCardPosition({
      pinPosition: mapData.pinPosition,
      mapCenter: mapData.mapCenter,
    })
  }, [selectedRestaurant, mapData.pinPosition, mapData.mapCenter])

  const mapOptions = useMemo(() => createLeafletOptions(midpoint), [midpoint])

  const cardStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!cardPosition)
      return undefined
    return { left: cardPosition.left, top: cardPosition.top }
  }, [cardPosition])

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
          onRestaurantClick={handleRestaurantClick}
          onRestaurantClose={handleRestaurantClose}
          onPinPositionChange={handlePinPositionChange}
        />
      </MapContainer>

      {cardPosition && (
        <div
          className="absolute z-[999] hidden w-60 overflow-hidden rounded-2xl md:block"
          style={cardStyle}
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
