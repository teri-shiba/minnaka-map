import type { MapData, MapItems } from '~/types/map'
import type { RestaurantListItem } from '~/types/restaurant'
import { useCallback } from 'react'
import { useMapEvent, ZoomControl } from 'react-leaflet'
import { useMapCoordinates } from '~/hooks/useMapCoordinates'
import MapTilerLayer from './map-layer'
import MidpointMarker from './midpoint-marker'
import RestaurantMarker from './restaurant-marker'

interface MapContentProps extends MapItems {
  selectedRestaurant: RestaurantListItem | null
  onRestaurantClick: (restaurant: RestaurantListItem) => void
  onRestaurantClose: () => void
  onMarkerPositionChange: (data: MapData) => void
}

export default function MapContent({
  apiKey,
  midpoint,
  restaurants,
  selectedRestaurant,
  onRestaurantClick,
  onRestaurantClose,
  onMarkerPositionChange,
}: MapContentProps) {
  useMapCoordinates(
    selectedRestaurant
      ? [selectedRestaurant.lat, selectedRestaurant.lng]
      : null,
    onMarkerPositionChange,
  )

  const handleMapClick = useCallback(() => {
    if (selectedRestaurant)
      onRestaurantClose()
  }, [selectedRestaurant, onRestaurantClose])

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
