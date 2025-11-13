import type { FavoriteGroupWithDetails, FavoritesWithDetails } from '~/types/favorite'
import type { RestaurantListItem } from '~/types/restaurant'

export function buildFavoriteRestaurant(
  id: string,
  overrides?: Partial<RestaurantListItem>,
): RestaurantListItem {
  return {
    id,
    name: `居酒屋${id}`,
    station: '東京',
    lat: 35.681236,
    lng: 139.767125,
    genreName: '居酒屋',
    genreCode: 'G001',
    imageUrl: `https://example.com/${id}.jpg`,
    close: '年中無休',
    ...overrides,
  }
}

export function buildFavoriteWithDetails(
  id: number,
  searchHistoryId: number,
  restaurant: RestaurantListItem,
): FavoritesWithDetails {
  return {
    id,
    searchHistoryId,
    restaurant,
  }
}

export function buildFavoriteGroup(
  searchHistoryId: number,
  stationNames: string[],
  favorites: FavoritesWithDetails[],
): FavoriteGroupWithDetails {
  return {
    searchHistory: {
      id: searchHistoryId,
      stationNames,
    },
    favorites,
  }
}
