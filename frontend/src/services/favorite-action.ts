'use server'

import type { ApiResponse } from '~/types/api-response'
import type {
  Favorite,
  FavoriteActionResponse,
  FavoriteGroup,
  FavoriteGroupWithDetails,
  FavoriteStatus,
  RawFavoriteGroup,
} from '~/types/favorite'
import type { RestaurantListItem } from '~/types/restaurant'
import { logger } from '~/lib/logger'
import { apiFetch } from './api-client'
import { fetchRestaurantsByIds } from './fetch-restaurants'

function fallbackRestaurant(hotPepperId: string): RestaurantListItem {
  return {
    id: hotPepperId,
    name: 'レストラン情報取得エラー',
    imageUrl: '',
    genreName: '不明',
    station: '不明',
    close: '不明',
    lat: 0,
    lng: 0,
    genreCode: 'unknown',
  }
}

// すべてのお気に入りを取得
export async function getFavorites(): Promise<ApiResponse<FavoriteGroup[]>> {
  try {
    const response = await apiFetch<ApiResponse<RawFavoriteGroup[]>>('favorites', 'GET')

    if (!response.success)
      return { success: false, data: [], message: response.message }

    const normalizedData: FavoriteGroup[] = response.data.map(group => ({
      searchHistory: {
        id: group.search_history.id,
        stationNames: group.search_history.station_names,
      },
      favorites: group.favorites.map((fav): Favorite => ({
        id: fav.id,
        hotPepperId: fav.hotpepper_id,
        searchHistoryId: fav.search_history_id,
      })),
    }))

    return { success: true, data: normalizedData }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchFavorites' } })
    return { success: false, data: [], message: '予期しないエラーが発生しました' }
  }
}

// 詳細情報付きのお気に入りを取得
export async function getFavoritesWithDetails(): Promise<ApiResponse<FavoriteGroupWithDetails[]>> {
  try {
    const favoritesResponse = await getFavorites()

    if (!favoritesResponse.success) {
      return { success: false, data: [], message: favoritesResponse.message }
    }

    const hotPepperId = Array.from(
      new Set(favoritesResponse.data.flatMap(group => group.favorites.map(fav => fav.hotPepperId))),
    )

    const restaurantDetails = await fetchRestaurantsByIds({ restaurantIds: hotPepperId })
    const restaurantMap = new Map<string, RestaurantListItem>(
      restaurantDetails.map(res => [res.id, res]),
    )

    const groupsWithDetails = favoritesResponse.data.map(group => ({
      searchHistory: group.searchHistory,
      favorites: group.favorites.map(favorite => ({
        id: favorite.id,
        searchHistoryId: favorite.searchHistoryId,
        restaurant: restaurantMap.get(favorite.hotPepperId) ?? fallbackRestaurant(favorite.hotPepperId),
      })),
    }))

    return { success: true, data: groupsWithDetails }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchFavoritesWithDetails' } })
    return { success: false, data: [], message: '予期しないエラーが発生しました' }
  }
}

// 指定した店舗がお気に入りかを確認
export async function checkFavoriteStatus(
  hotPepperId: string,
  searchHistoryId: string,
): Promise<FavoriteStatus> {
  try {
    const favoritesResponse = await getFavorites()

    if (!favoritesResponse.success) {
      return { isFavorite: false, favoriteId: null, message: favoritesResponse.message }
    }

    const matchedGroup = favoritesResponse.data.find(
      group => group.searchHistory.id.toString() === searchHistoryId,
    )

    if (!matchedGroup)
      return { isFavorite: false, favoriteId: null }

    const matchedFavorite = matchedGroup.favorites.find(
      favoriteItem => favoriteItem.hotPepperId === hotPepperId,
    )

    if (!matchedFavorite)
      return { isFavorite: false, favoriteId: null }

    return { isFavorite: true, favoriteId: matchedFavorite.id }
  }
  catch (error) {
    logger(error, { tags: { component: 'checkFavoriteStatus' } })
    return { isFavorite: false, favoriteId: null, message: '予期しないエラーが発生しました' }
  }
}

// お気に入り追加
export async function addToFavorites(
  hotPepperId: string,
  searchHistoryId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetch<ApiResponse<{ id: number }>>('favorites', 'POST', {
      favorite: {
        search_history_id: searchHistoryId,
        hotpepper_id: hotPepperId,
      },
    })

    if (!response.success)
      return { success: false, message: response.message }

    return { success: true, favoriteId: response.data.id }
  }
  catch (error) {
    logger(error, { tags: { component: 'addToFavorites' } })
    return { success: false, message: '予期しないエラーが発生しました' }
  }
}

// お気に入り削除
export async function removeFromFavorites(
  favoriteId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetch<ApiResponse<null>>(`favorites/${favoriteId}`, 'DELETE')

    if (!response.success)
      return { success: false, message: response.message }

    return { success: true }
  }
  catch (error) {
    logger(error, { tags: { component: 'removeFromFavorites' } })
    return { success: false, message: '予期しないエラーが発生しました' }
  }
}
