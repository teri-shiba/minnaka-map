import type { LatLngExpression } from 'leaflet'

export interface RestaurantProps {
  id: string | number
  name: string
  lat: number
  lng: number
  category?: string
  rating?: number
}

// TODO: レストランの実装時にコメントを復活
export interface MapProps {
  apiKey: string
  // restaurants: RestaurantProps[]
  midpoint: LatLngExpression
  // onMarkerClick?: (id: string | number) => void
}
