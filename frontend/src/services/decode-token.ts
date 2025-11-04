'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface DecodeToken {
  searchHistoryId: string
  restaurantId: string
}

export async function decodeToken(
  token: string,
): Promise<ServiceResult<DecodeToken>> {
  try {
    const auth = await getAuthFromCookie()
    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/favorite_tokens/decode', process.env.API_BASE_URL)

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const requestBody = toSnakeDeep({ token })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'トークンのでコードに失敗しました')

    const json = await response.json()
    const data = toCamelDeep(json.data)

    return {
      success: true,
      data: {
        searchHistoryId: String(data.searchHistoryId),
        restaurantId: data.restaurantId,
      },
    }
  }
  catch (error) {
    logger(error, {
      component: 'decodeToken',
      extra: {
        token: `${token.substring(0, 20)}...`,
      },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
