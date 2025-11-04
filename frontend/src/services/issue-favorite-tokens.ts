'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface FavoriteTokens {
  restaurantId: string
  favoriteToken: string
}

interface FavoriteTokensParams {
  searchHistoryId: number
  restaurantIds: string[]
  lat: string
  lng: string
  sig: string
  exp: string
}

interface FavoriteTokensData {
  tokens: FavoriteTokens[]
}

export async function issueFavoriteTokens(
  params: FavoriteTokensParams,
): Promise<ServiceResult<FavoriteTokensData>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/favorite_tokens/batch', process.env.API_BASE_URL)

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const requestBody = toSnakeDeep({
      searchHistoryId: params.searchHistoryId,
      restaurantIds: params.restaurantIds,
      lat: params.lat,
      lng: params.lng,
      sig: params.sig,
      exp: params.exp,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'トークンの発行に失敗しました')

    const json = await response.json()
    const data = toCamelDeep(json.data)

    return {
      success: true,
      data: {
        tokens: data.tokens || [],
      },
    }
  }
  catch (error) {
    logger(error, {
      component: 'issueFavoriteTokens',
      extra: { params },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
