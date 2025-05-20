import type { LatLngExpression } from 'leaflet'

export interface RestaurantProps {
  id: string | number
  name: string
  lat: number
  lng: number
  category?: string
  rating?: number
}

export interface MapProps {
  userLocation: LatLngExpression
  className?: string
}
