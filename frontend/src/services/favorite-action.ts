'use server'

import type { ApiResponse } from '~/types/api-response'
import type {
  Favorite,
  FavoriteActionResponse,
  FavoriteGroup,
  FavoritesPaginationMeta,
  FavoriteStatus,
  PaginatedFavoritesResponse,

} from '~/types/favorite'
import type { RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { FAVORITE_GROUPS_PER_PAGE, FAVORITES_FIRST_PAGE } from '~/constants'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetchAuth, handleApiError } from './api-client'
import { fetchRestaurantsByIds } from './fetch-restaurants'

// TODO: ファイルを分割する
// すべてのお気に入りを取得
export async function getFavorites(): Promise<ServiceResult<FavoriteGroup[]>> {
  try {
    // TODO: 型を作る
    const response = await apiFetchAuth<ApiResponse<Array<{
      searchHistory: { id: number, stationNames: string[] }
      favorites: Array<{ id: number, hotpepperId: string, searchHistoryId: number }>
    }>>>('favorites')

    if (!isApiSuccess(response)) {
      return {
        success: false,
        message: getApiErrorMessage(response),
        cause: 'REQUEST_FAILED',
      }
    }

    const normalizedData: FavoriteGroup[] = response.data.map(group => ({
      searchHistory: group.searchHistory,
      favorites: group.favorites.map((fav): Favorite => ({
        id: fav.id,
        hotPepperId: fav.hotpepperId,
        searchHistoryId: fav.searchHistoryId,
      })),
    }))

    return { success: true, data: normalizedData }
  }
  catch (error) {
    return handleApiError(error, {
      component: 'getFavorites',
      defaultMessage: '予期しないエラーが発生しました',
    })
  }
}

// 詳細情報付きのお気に入りを取得（ページネーション対応）
export async function getFavoritesWithDetailsPaginated(
  page: number = FAVORITES_FIRST_PAGE,
  limit: number = FAVORITE_GROUPS_PER_PAGE,
): Promise<PaginatedFavoritesResponse> {
  try {
    const response = await apiFetchAuth<ApiResponse<Array<{
      searchHistory: { id: number, stationNames: string[] }
      favorites: Array<{ id: number, hotpepperId: string, searchHistoryId: number }>
    }>> & { meta: FavoritesPaginationMeta }>(
      `favorites?page=${page}&limit=${limit}`,
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
      new Set(response.data.flatMap(group => group.favorites.map(fav => fav.hotpepperId))),
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
        id: group.searchHistory.id,
        stationNames: group.searchHistory.stationNames,
      },
      favorites: group.favorites
        .map((favorite) => {
          const restaurant = restaurantMap.get(favorite.hotpepperId)
          if (!restaurant)
            return null
          return {
            id: favorite.id,
            searchHistoryId: favorite.searchHistoryId,
            restaurant,
          }
        })
        .filter(isNotNull),
    }))

    const normalizedMeta: FavoritesPaginationMeta = response.meta

    return { success: true, data: groupsWithDetails, meta: normalizedMeta }
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'getFavoritesWithDetailsPaginated',
      defaultMessage: '予期しないエラーが発生しました',
    })

    return {
      success: false,
      data: [],
      meta: { currentPage: page, totalGroups: 0, hasMore: false },
      message: failure.message,
    }
  }
}

// 指定した店舗がお気に入りかを確認
export async function checkFavoriteStatus(
  hotpepperId: string,
  searchHistoryId: string,
): Promise<FavoriteStatus> {
  try {
    const response = await apiFetchAuth<
      ApiResponse<{ isFavorite: boolean, favoriteId: number | null }>
    >('favorites/status', {
      params: { searchHistoryId, hotpepperId },
    })

    if (!isApiSuccess(response)) {
      return {
        isFavorite: false,
        favoriteId: null,
        message: getApiErrorMessage(response),
      }
    }

    return {
      isFavorite: response.data.isFavorite,
      favoriteId: response.data.favoriteId,
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'checkFavoriteStatus' } })
    return {
      isFavorite: false,
      favoriteId: null,
      message: '予期しないエラーが発生しました',
    }
  }
}

// お気に入り追加
export async function addToFavorites(
  hotpepperId: string,
  searchHistoryId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetchAuth<ApiResponse<{ id: number }>>(
      'favorites',
      {
        method: 'POST',
        body: {
          favorite: { searchHistoryId, hotpepperId },
        },
      },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true, favoriteId: response.data.id }
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'addToFavorites',
      defaultMessage: 'お気に入りの追加に失敗しました',
    })
    return { success: false, message: failure.message }
  }
}

// お気に入り削除
export async function removeFromFavorites(
  favoriteId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetchAuth<ApiResponse<null> | null>(
      `favorites/${favoriteId}`,
      { method: 'DELETE' },
    )

    if (response === null)
      return { success: true }

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true }
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'removeFromFavorites',
      defaultMessage: 'お気に入りの削除に失敗しました',
    })
    return { success: false, message: failure.message }
  }
}
