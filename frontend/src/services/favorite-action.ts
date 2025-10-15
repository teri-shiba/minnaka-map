'use server'

import type {
  FavoriteActionResponse,
  FavoriteGroup,
  FavoriteStatus,
  FavoritesWithDetails,
  PaginatedFavoritesResponse,
} from '~/types/favorite'
import type { CreateFavoriteRes, DeleteFavoriteRes, GetFavoritesPageRes, GetFavoritesRes, GetFavoriteStatusRes } from '~/types/favorite.dto'
import type { RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { FAVORITE_GROUPS_PER_PAGE, FAVORITES_FIRST_PAGE } from '~/constants'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch, handleApiError } from './api-client'
import { fetchRestaurantsByIds } from './fetch-restaurants'

// TODO: ファイルを分割する getFavorites, getFavoritesWithDetailsPaginated / checkFavoriteStatus / addToFavorites, removeFromFavorites
// すべてのお気に入りを取得
export async function getFavorites(): Promise<ServiceResult<FavoriteGroup[]>> {
  try {
    const response = await apiFetch<GetFavoritesRes>
    ('favorites', { withAuth: true })

    if (!isApiSuccess(response)) {
      return {
        success: false,
        message: getApiErrorMessage(response),
        cause: 'REQUEST_FAILED',
      }
    }

    return { success: true, data: response.data }
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
    const response = await apiFetch<GetFavoritesPageRes>(
      `favorites?page=${page}&limit=${limit}`,
      { withAuth: true },
    )

    if (!isApiSuccess(response)) {
      return {
        success: false,
        data: [],
        meta: {
          currentPage: page,
          totalGroups: 0,
          hasMore: false,
        },
        message: getApiErrorMessage(response),
      }
    }

    const hotpepperIds = Array.from(
      new Set(
        response.data.flatMap(g => g.favorites.map(f => f.hotpepperId)),
      ),
    )

    let restaurantMap = new Map<string, RestaurantListItem>()
    if (hotpepperIds.length > 0) {
      const [first, ...rest] = hotpepperIds
      const restaurantIds: [string, ...string[]] = [first, ...rest]
      const restaurantResult = await fetchRestaurantsByIds({ restaurantIds })

      if (!restaurantResult.success) {
        logger(new Error(restaurantResult.message), {
          component: 'getFavoritesWithDetailsPaginated',
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

    const groupsWithDetails = response.data.map(group => ({
      searchHistory: group.searchHistory,
      favorites: group.favorites.flatMap<FavoritesWithDetails>((fav) => {
        const restaurant = restaurantMap.get(fav.hotpepperId)
        return restaurant
          ? [{ id: fav.id, searchHistoryId: fav.searchHistoryId, restaurant }]
          : []
      }),
    }))

    return {
      success: true,
      data: groupsWithDetails,
      meta: response.meta,
    }
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
    const response = await apiFetch<GetFavoriteStatusRes>('favorites/status', {
      params: { searchHistoryId, hotpepperId },
      withAuth: true,
    })

    if (!isApiSuccess(response)) {
      return {
        isFavorite: false,
        favoriteId: null,
        message: getApiErrorMessage(response),
      }
    }

    return response.data
  }
  catch (error) {
    logger(error, { component: 'checkFavoriteStatus' })
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
    const response = await apiFetch<CreateFavoriteRes>(
      'favorites',
      {
        method: 'POST',
        body: {
          favorite: { searchHistoryId, hotpepperId },
        },
        withAuth: true,
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
    const response = await apiFetch<DeleteFavoriteRes>(
      `favorites/${favoriteId}`,
      { method: 'DELETE', withAuth: true },
    )

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
