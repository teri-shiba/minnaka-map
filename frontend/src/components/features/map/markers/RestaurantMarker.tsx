'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import L from 'leaflet'
import { useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'

interface RestaurantMarkerProps {
  restaurants: RestaurantListItem[]
  onRestaurantClick: (restaurant: RestaurantListItem) => void
}

export default function RestaurantMarkers({ restaurants, onRestaurantClick }: RestaurantMarkerProps) {
  const icon = useMemo(() => {
    return L.icon({
      iconUrl: '/figure_pin_restaurant.webp',
      iconSize: [40, 44],
      iconAnchor: [20, 34],
    })
  }, [])

  return (
    <>
      {restaurants.map(restaurant => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onRestaurantClick(restaurant),
          }}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -32]}
            className="!rounded-md !px-2 !text-secondary-foreground !shadow-none"
          >
            {restaurant.name}
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}
