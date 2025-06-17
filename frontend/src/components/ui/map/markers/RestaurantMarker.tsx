'use client'

import L from 'leaflet'
import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'

interface RestaurantMarkerProps {
  restaurant: number
  onClick: () => void
}

// TODO: `<div style"..."` を Tailwind に置き換える
// TODO: カテゴリ不要なら消す
function createRestaurantIcon(category) {
  const color = {
    italian: 'green',
    japanese: 'red',
    cafe: 'orange',
  }

  // TODO: ただの四角い図形なので、画像に置き換える
  const myStyle = {
    backgroundColor: '${color}',
    width: '20px',
    height: '20px',
    borderEadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style={myStyle}></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function RestaurantMarker({ restaurant, onClick }: RestaurantMarkerProps) {
  const icon = useMemo(() => {
    createRestaurantIcon(restaurant.category)
  }, [restaurant.category])

  return (
    <Marker
      position={[restaurant.lat, restaurant.lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-bold ">{restaurant.name}</h3>
          <p className="text-ts text-gray-600">{restaurant.catogory}</p>
          {restaurant.rating && (
            <div className="item-center mt-1 flex">
              <span className="mr-1 text-yellow-500">★</span>
              <span className="text-ts">{restaurant.rating}</span>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
