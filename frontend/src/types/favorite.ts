import type { RestaurantListItem } from './restaurant'

interface SearchHistory {
  id: number
  stationNames: string[]
}

export interface FavoriteItem {
  id: number
  hotpepperId: string
  searchHistoryId: number
}

export interface FavoriteGroup {
  searchHistory: SearchHistory
  favorites: FavoriteItem[]
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

export interface FavoritesWithDetails {
  id: number
  searchHistoryId: number
  restaurant: RestaurantListItem
}

export interface FavoriteGroupWithDetails {
  searchHistory: SearchHistory
  favorites: FavoritesWithDetails[]
}

export interface FavoritesPaginationMeta {
  currentPage: number
  totalGroups: number
  hasMore: boolean
}

export interface PaginatedFavoritesResponse {
  success: boolean
  data: FavoriteGroupWithDetails[]
  meta: FavoritesPaginationMeta
  message?: string
}
