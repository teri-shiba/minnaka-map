'use server'

import type { FavoriteGroup, FavoriteGroupWithDetails, FavoritesPaginationMeta, FavoritesWithDetails } from '~/types/favorite'
import type { RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { FAVORITE_GROUPS_PER_PAGE, FAVORITES_FIRST_PAGE } from '~/constants'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { fetchRestaurantsByIds } from './fetch-restaurants-by-ids'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface FavoriteGroupsData {
  groups: FavoriteGroupWithDetails[]
  pagination: FavoritesPaginationMeta
}

export async function fetchFavoriteGroups(
  page: number = FAVORITES_FIRST_PAGE,
): Promise<ServiceResult<FavoriteGroupsData>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/favorites', process.env.API_BASE_URL)
    url.searchParams.set('page', String(page))
    url.searchParams.set('limit', String(FAVORITE_GROUPS_PER_PAGE))

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'お気に入り店舗を取得できませんでした')

    const json = await response.json()
    const favoriteGroups = toCamelDeep(json.data) as FavoriteGroup[]
    const pagination = toCamelDeep(json.meta)

    // 一意の HotPepper ID を抽出（重複除外）
    const allFavorites = favoriteGroups.flatMap(group => group.favorites)
    const allHotPepperIds = allFavorites.map(fav => fav.hotpepperId as string)
    const hotpepperIds = [...new Set(allHotPepperIds)]

    // HotPepper API から店舗詳細を取得して Map に格納
    let restaurantMap = new Map<string, RestaurantListItem>()

    if (hotpepperIds.length > 0) {
      const restaurantIds = hotpepperIds as [string, ...string[]]
      const restaurantResult = await fetchRestaurantsByIds(restaurantIds)

      if (!restaurantResult.success) {
        return {
          success: false,
          message: '店舗情報を取得できませんでした',
          cause: restaurantResult.cause,
        }
      }

      restaurantMap = new Map<string, RestaurantListItem>(
        restaurantResult.data.map(res => [res.id, res]),
      )
    }

    // 各お気に入りに店舗詳細を追加（店舗情報が見つからない場合は除外）
    const groupsWithDetails = favoriteGroups.map((group) => {
      const favoritesWithDetails = group.favorites.flatMap(
        (fav): FavoritesWithDetails[] => {
          const restaurant = restaurantMap.get(fav.hotpepperId)

          if (!restaurant)
            return []

          return [{
            id: fav.id,
            searchHistoryId: fav.searchHistoryId,
            restaurant,
          }]
        },
      )

      return {
        searchHistory: group.searchHistory,
        favorites: favoritesWithDetails,
      }
    })

    return {
      success: true,
      data: {
        groups: groupsWithDetails,
        pagination,
      },
    }
  }
  catch (error) {
    logger(error, {
      component: 'fetchFavoriteGroups',
      extra: { page },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
