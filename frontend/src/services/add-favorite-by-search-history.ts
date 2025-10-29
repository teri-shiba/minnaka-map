'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface AddFavoriteData {
  favoriteId: number
  hotpepperId: string
}

export async function addFavoriteBySearchHistory(
  hotpepperId: string,
  searchHistoryId: string,
): Promise<ServiceResult<AddFavoriteData>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/favorites/by_search_history', process.env.API_BASE_URL)

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const requestBody = toSnakeDeep({
      searchHistoryId,
      hotpepperId,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'お気に入りの追加に失敗しました')

    const json = await response.json()
    const data = toCamelDeep(json.data)

    return {
      success: true,
      data: {
        favoriteId: data.id,
        hotpepperId: data.hotpepperId,
      },
    }
  }
  catch (error) {
    logger(error, {
      component: 'addFavoriteBySearchHistory',
      extra: {
        hotpepperId,
        searchHistoryId,
      },
    })

    const errorInfo = getErrorInfo({
      error,
      notFoundErrorMessage: 'お気に入りの追加に失敗しました',
    })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
