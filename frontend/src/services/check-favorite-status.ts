'use server'

import type { FavoriteStatus } from '~/types/favorite'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

export async function checkFavoriteStatus(
  hotpepperId: string,
  searchHistoryId: string,
): Promise<ServiceResult<FavoriteStatus>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/favorites/status', process.env.API_BASE_URL)
    url.searchParams.set('search_history_id', searchHistoryId)
    url.searchParams.set('hotpepper_id', hotpepperId)

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
      throw new HttpError(response.status, 'お気に入り登録情報を取得できませんでした')

    const json = await response.json()
    const { isFavorite, favoriteId } = toCamelDeep(json.data)

    return {
      success: true,
      data: { isFavorite, favoriteId },
    }
  }
  catch (error) {
    logger(error, {
      component: 'checkFavoriteStatus',
      extra: { hotpepperId, searchHistoryId },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
