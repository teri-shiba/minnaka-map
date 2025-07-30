import type { RestaurantListItem } from './restaurant'

export interface RawFavorite {
  id: number
  hotpepper_id: string
  search_history_id: number
}

export interface RawFavoriteGroup {
  search_history: {
    id: number
    station_names: string[]
  }
  favorites: RawFavorite[]
}

export interface Favorite {
  id: number
  hotPepperId: string
  searchHistoryId: number
}

export interface FavoriteStatus {
  isFavorite: boolean
  favoriteId: number | null
  message?: string
}

export interface FavoriteActionResponse {
  success: boolean
  favoriteId?: number
  message?: string
}

export interface SearchHistory {
  id: number
  stationNames: string[]
}

export interface FavoriteGroup {
  searchHistory: SearchHistory
  favorites: Favorite[]
}

export interface FavoritesWithDetails {
  id: number
  searchHistoryId: number
  restaurant: RestaurantListItem
}

export interface FavoriteGroupWithDetails {
  searchHistory: SearchHistory
  favorites: FavoritesWithDetails[]
}
