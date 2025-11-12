'use client'

import type { LatLngBoundsExpression } from 'leaflet'
import type { MapData, MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useCallback } from 'react'
import { useMapEvent, ZoomControl } from 'react-leaflet'
import { useMapCoords } from '~/hooks/useMapCoords'
import MapTilerLayer from './map-layer'
import MidpointMarker from './midpoint-marker'
import RestaurantMarker from './restaurant-marker'

interface MapContentProps extends MapItems {
  selectedRestaurant: RestaurantListItem | null
  onRestaurantClick: (restaurant: RestaurantListItem) => void
  onRestaurantClose: () => void
  onMarkerPositionChange: (data: MapData) => void
  maxBounds?: LatLngBoundsExpression
}

export default function MapContent({
  midpoint,
  restaurants,
  selectedRestaurant,
  onRestaurantClick,
  onRestaurantClose,
  onMarkerPositionChange,
  maxBounds,
}: MapContentProps) {
  useMapCoords(
    selectedRestaurant?.lat ?? null,
    selectedRestaurant?.lng ?? null,
    onMarkerPositionChange,
  )

  const handleMapClick = useCallback(() => {
    if (selectedRestaurant)
      onRestaurantClose()
  }, [selectedRestaurant, onRestaurantClose])

  const handleMoveStart = useCallback(() => {
    if (selectedRestaurant)
      onRestaurantClose()
  }, [selectedRestaurant, onRestaurantClose])

  const handleZoomEnd = useCallback(() => {
    if (selectedRestaurant)
      onRestaurantClose()
  }, [selectedRestaurant, onRestaurantClose])

  const handleRestaurantClick = useCallback(
    (restaurant: RestaurantListItem) => {
      onRestaurantClick(restaurant)
    },
    [onRestaurantClick],
  )

  useMapEvent('click', handleMapClick)
  useMapEvent('movestart', handleMoveStart)
  useMapEvent('zoomend', handleZoomEnd)

  return (
    <>
      <MapTilerLayer maxBounds={maxBounds} />
      <ZoomControl position="topright" />
      <MidpointMarker position={midpoint} />
      <RestaurantMarker
        restaurants={restaurants}
        onRestaurantClick={handleRestaurantClick}
        selectedRestaurantId={selectedRestaurant?.id}
      />
    </>
  )
}
