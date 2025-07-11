import type { LatLngExpression } from 'leaflet'
import type { RestaurantListItem } from './restaurant'

export interface MapItems {
  apiKey: string
  midpoint: LatLngExpression
  restaurants: RestaurantListItem[]
}
