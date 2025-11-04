'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

export async function removeFavorite(
  favoriteId: number,
): Promise<ServiceResult<{ id: number }>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL(
      `/api/v1/favorites/${favoriteId}`,
      process.env.API_BASE_URL,
    )

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'お気に入りの削除に失敗しました')

    return {
      success: true,
      data: { id: favoriteId },
    }
  }
  catch (error) {
    logger(error, {
      component: 'removeFromFavorites',
      extra: { favoriteId },
    })

    const errorInfo = getErrorInfo({
      error,
      notFoundErrorMessage: 'お気に入りが見つかりませんでした',
    })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
