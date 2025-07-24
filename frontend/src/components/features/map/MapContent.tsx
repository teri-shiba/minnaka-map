import type { MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useCallback } from 'react'
import { useMapEvent, ZoomControl } from 'react-leaflet'
import { useMapCoordinates } from '~/hooks/useMapCoordinates'
import MapTilerLayer from './layers/MapTilerLayer'
import MidpointMarker from './markers/MidpointMarker'
import RestaurantMarker from './markers/RestaurantMarker'

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

export default function MapContent({
  apiKey,
  midpoint,
  restaurants,
  selectedRestaurant,
  onRestaurantClick,
  onRestaurantClose,
  onPinPositionChange,
}: MapContentProps) {
  useMapCoordinates(
    selectedRestaurant ? [selectedRestaurant.lat, selectedRestaurant.lng] : null,
    onPinPositionChange,
  )

  const handleMapClick = useCallback(
    () => {
      if (selectedRestaurant) {
        onRestaurantClose()
      }
    },
    [selectedRestaurant, onRestaurantClose],
  )

  useMapEvent('click', handleMapClick)

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
