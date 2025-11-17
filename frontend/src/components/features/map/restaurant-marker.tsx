'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import L from 'leaflet'
import { memo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import { ICON } from '~/constants'

const defaultIcon = L.icon({
  iconUrl: '/figure_marker_restaurant.webp',
  iconSize: ICON.SIZE,
  iconAnchor: ICON.ANCHOR,
})

const selectedIcon = L.icon({
  iconUrl: '/figure_marker_restaurant_selected.webp',
  iconSize: ICON.SIZE,
  iconAnchor: ICON.ANCHOR,
})

interface RestaurantMarkerProps {
  restaurants: RestaurantListItem[]
  onRestaurantClick: (restaurant: RestaurantListItem) => void
  selectedRestaurantId?: string | null
}

function RestaurantMarkers({
  restaurants,
  onRestaurantClick,
  selectedRestaurantId,
}: RestaurantMarkerProps) {
  return (
    <>
      {restaurants.map((restaurant) => {
        const { id, name, lat, lng } = restaurant
        const isSelected = id === selectedRestaurantId
        const icon = isSelected ? selectedIcon : defaultIcon

        return (
          <Marker
            key={id}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
              click: () => onRestaurantClick(restaurant),
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -32]}
              className="!pointer-events-auto !cursor-pointer !rounded-md !px-2 !text-secondary-foreground !shadow-none"
            >
              {name}
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

export default memo(RestaurantMarkers)
