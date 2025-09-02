'use client'

import type { CardPosition, MapData, MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { calculateCardPosition } from '~/utils/calculate-card-position'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapContent from './map-content'
import MapRestaurantCard from './map-restaurant-card'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function MapCanvas({ apiKey, midpoint, restaurants }: MapItems) {
  const [selected, setSelected] = useState<RestaurantListItem | null>(null)
  const [mapData, setMapData] = useState<MapData>({
    pinPosition: null,
    mapCenter: null,
    mapSize: null,
  })

  useEffect(() => {
    const id = requestAnimationFrame(() => setSelected(null))
    return () => cancelAnimationFrame(id)
  }, [restaurants])

  const handleRestaurantClick = useCallback(
    (restaurant: RestaurantListItem) => setSelected(restaurant),
    [],
  )

  const handleRestaurantClose = useCallback(() => setSelected(null), [])

  const handlePinPositionChange = setMapData

  const cardPosition = useMemo<CardPosition | null>(() => {
    const { pinPosition, mapCenter } = mapData
    return selected && pinPosition && mapCenter
      ? calculateCardPosition({ pinPosition, mapCenter })
      : null
  }, [selected, mapData])

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
          selectedRestaurant={selected}
          onRestaurantClick={handleRestaurantClick}
          onRestaurantClose={handleRestaurantClose}
          onPinPositionChange={handlePinPositionChange}
        />
      </MapContainer>

      {selected && cardPosition && (
        <div
          className="absolute z-[999] hidden w-60 overflow-hidden rounded-2xl md:block"
          style={cardStyle}
        >
          <MapRestaurantCard
            restaurant={selected!}
            onClose={() => setSelected(null)}
          />
        </div>
      )}

      {selected && (
        <div className="absolute inset-x-0 bottom-8 z-[999] mx-auto w-11/12 max-w-96 overflow-hidden rounded-2xl  md:hidden">
          <MapRestaurantCard
            restaurant={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </main>
  )
}
