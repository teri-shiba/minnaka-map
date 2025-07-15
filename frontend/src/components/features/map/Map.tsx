'use client'

import type { MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useEffect, useState } from 'react'
import { MapContainer, useMap, ZoomControl } from 'react-leaflet'
import { useMapCoordinates } from '~/hooks/useMapCoordinates'
import { calculateCardPosition } from '~/utils/calculate-card-position'
import { createLeafletOptions } from '~/utils/create-leaflet-options'
import MapTilerLayer from './layers/MapTilerLayer'
import MapRestaurantCard from './MapRestaurantCard'
import MidpointMarker from './markers/MidpointMarker'
import RestaurantMarker from './markers/RestaurantMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

interface MapContentProps extends MapItems {
  selectedRestaurant: RestaurantListItem | null
  onRestaurantClick: (restaurant: RestaurantListItem) => void
  onRestaurantClose: () => void
  onPinPositionChange: (data: {
    pinPosition: { x: number, y: number } | null
    mapCenter: { x: number, y: number } | null
    mapSize: { width: number, height: number } | null
  }) => void
}

function MapContent({
  apiKey,
  midpoint,
  restaurants,
  selectedRestaurant,
  onRestaurantClick,
  onRestaurantClose,
  onPinPositionChange,
}: MapContentProps) {
  const { pinPosition, mapCenter, mapSize } = useMapCoordinates(
    selectedRestaurant ? [selectedRestaurant.lat, selectedRestaurant.lng] : null,
  )

  const map = useMap()

  useEffect(() => {
    if (!map)
      return

    const handleMapClick = () => {
      if (selectedRestaurant) {
        onRestaurantClose()
      }
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, selectedRestaurant, onRestaurantClose])

  useEffect(() => {
    onPinPositionChange({ pinPosition, mapCenter, mapSize })
  }, [pinPosition, mapCenter, mapSize, onPinPositionChange])

  return (
    <>
      {apiKey && <MapTilerLayer apiKey={apiKey} />}
      <ZoomControl position="topright" />
      <MidpointMarker position={midpoint} />
      <RestaurantMarker
        restaurants={restaurants}
        onRestaurantClick={onRestaurantClick}
        selectedRestaurantId={selectedRestaurant?.id}
      />
    </>
  )
}

export default function Map({
  apiKey,
  midpoint,
  restaurants,
}: MapItems) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null)
  const [mapData, setMapData] = useState<{
    pinPosition: { x: number, y: number } | null
    mapCenter: { x: number, y: number } | null
    mapSize: { width: number, height: number } | null
  }>({
    pinPosition: null,
    mapCenter: null,
    mapSize: null,
  })

  const [cardOffset, setCardOffset] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    setSelectedRestaurant(null)
    setCardOffset(null)
  }, [restaurants])

  useEffect(() => {
    setCardOffset(null)
  }, [selectedRestaurant?.id])

  useEffect(() => {
    if (selectedRestaurant && mapData.pinPosition && mapData.mapCenter && mapData.mapSize) {
      const initialCardPosition = calculateCardPosition({
        pinPosition: mapData.pinPosition,
        mapCenter: mapData.mapCenter,
        mapSize: mapData.mapSize,
      })

      const offset = {
        x: initialCardPosition.left - mapData.pinPosition.x,
        y: initialCardPosition.top - mapData.pinPosition.y,
      }
      setCardOffset(offset)
    }
  }, [selectedRestaurant?.id, mapData.pinPosition, mapData.mapCenter, mapData.mapSize])

  const mapOptions = createLeafletOptions(midpoint)

  return (
    <main className="relative z-40 size-full flex-1 overflow-hidden">
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
            setCardOffset(null)
          }}
          onPinPositionChange={setMapData}
        />
      </MapContainer>

      {selectedRestaurant && mapData.pinPosition && cardOffset && (
        <div
          className="absolute z-[999] hidden w-60 overflow-hidden rounded-2xl md:block"
          style={{
            left: mapData.pinPosition.x + cardOffset.x,
            top: mapData.pinPosition.y + cardOffset.y,
            transform: '',
          }}
        >
          <MapRestaurantCard
            restaurant={selectedRestaurant}
            onClose={() => {
              setSelectedRestaurant(null)
              setCardOffset(null)
            }}
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
