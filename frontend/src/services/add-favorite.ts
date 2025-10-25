'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface AddFavoriteData {
  favoriteId: number
}

export async function addFavorite(
  hotpepperId: string,
  searchHistoryId: number,
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

    const url = new URL('/api/v1/favorites', process.env.API_BASE_URL)

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const requestBody = toSnakeDeep({
      favorite: { searchHistoryId, hotpepperId },
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
    const { id } = toCamelDeep(json.data)

    return {
      success: true,
      data: { favoriteId: id },
    }
  }
  catch (error) {
    logger(error, {
      component: 'addFavorites',
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
