'use server'

import type { ApiResponse } from '~/types/api-response'
import type {
  Favorite,
  FavoriteActionResponse,
  FavoriteGroup,
  FavoritesPaginationMeta,
  FavoriteStatus,
  PaginatedFavoritesResponse,
  RawFavoriteGroup,
  RawFavoritePaginationMeta,
} from '~/types/favorite'
import type { RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'
import { fetchRestaurantsByIds } from './fetch-restaurants'

// すべてのお気に入りを取得
export async function getFavorites(): Promise<ServiceResult<FavoriteGroup[]>> {
  try {
    const response = await apiFetch<ApiResponse<RawFavoriteGroup[]>>('favorites', 'GET')

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response), cause: 'REQUEST_FAILED' }

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
    return { success: false, message: '予期しないエラーが発生しました', cause: 'NETWORK' }
  }
}

// 詳細情報付きのお気に入りを取得（ページネーション対応）
export async function getFavoritesWithDetailsPaginated(
  page: number = 1,
  limit: number = 5,
): Promise<PaginatedFavoritesResponse> {
  try {
    const response = await apiFetch<ApiResponse<RawFavoriteGroup[]> & { meta: RawFavoritePaginationMeta }>(
      `favorites?page=${page}&limit=${limit}`,
      'GET',
    )

    if (!isApiSuccess(response)) {
      return {
        success: false,
        data: [],
        meta: { currentPage: page, totalGroups: 0, hasMore: false },
        message: getApiErrorMessage(response),
      }
    }

    const hotPepperIds = Array.from(
      new Set(response.data.flatMap(group => group.favorites.map(fav => fav.hotpepper_id))),
    )

    let restaurantMap = new Map<string, RestaurantListItem>()
    if (hotPepperIds.length > 0) {
      const [first, ...rest] = hotPepperIds
      const restaurantIds: [string, ...string[]] = [first, ...rest]
      const restaurantResult = await fetchRestaurantsByIds({ restaurantIds })

      if (!restaurantResult.success) {
        logger(new Error(restaurantResult.message), {
          tags: { component: 'getFavoritesWithDetailsPaginated' },
        })
        return {
          success: false,
          data: [],
          meta: { currentPage: page, totalGroups: 0, hasMore: false },
          message: 'レストラン情報の取得に失敗しました',
        }
      }

      restaurantMap = new Map<string, RestaurantListItem>(
        restaurantResult.data.map(res => [res.id, res]),
      )
    }

    const isNotNull = <T>(value: T | null): value is T => value !== null

    const groupsWithDetails = response.data.map(group => ({
      searchHistory: {
        id: group.search_history.id,
        stationNames: group.search_history.station_names,
      },
      favorites: group.favorites
        .map((favorite) => {
          const restaurant = restaurantMap.get(favorite.hotpepper_id)
          if (!restaurant)
            return null
          return {
            id: favorite.id,
            searchHistoryId: favorite.search_history_id,
            restaurant,
          }
        })
        .filter(isNotNull),
    }))

    const normalizedMeta: FavoritesPaginationMeta = {
      currentPage: response.meta.current_page,
      totalGroups: response.meta.total_groups,
      hasMore: response.meta.has_more,
    }

    return { success: true, data: groupsWithDetails, meta: normalizedMeta }
  }
  catch (error) {
    logger(error, { tags: { component: getFavoritesWithDetailsPaginated } })
    return {
      success: false,
      data: [],
      meta: { currentPage: page, totalGroups: 0, hasMore: false },
      message: '予期しないエラーが発生しました',
    }
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
    const response = await apiFetch<ApiResponse<{ id: number }>>(
      'favorites',
      'POST',
      {
        favorite: {
          search_history_id: searchHistoryId,
          hotpepper_id: hotPepperId,
        },
      },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

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
    const response = await apiFetch<ApiResponse<null>>(
      `favorites/${favoriteId}`,
      'DELETE',
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true }
  }
  catch (error) {
    logger(error, { tags: { component: 'removeFromFavorites' } })
    return { success: false, message: '予期しないエラーが発生しました' }
  }
}
