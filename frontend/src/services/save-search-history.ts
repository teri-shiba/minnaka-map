'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'
import { getAuthFromCookie } from './get-auth-from-cookie'

interface SearchHistory {
  searchHistoryId: number
}

export async function saveSearchHistory(
  stationIds: number[],
): Promise<ServiceResult<SearchHistory>> {
  try {
    const auth = await getAuthFromCookie()

    if (!auth) {
      return {
        success: false,
        message: 'ログインが必要です',
        cause: 'UNAUTHORIZED',
      }
    }

    const url = new URL('/api/v1/search_histories', process.env.API_BASE_URL)

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': auth.accessToken,
      'client': auth.client,
      'uid': auth.uid,
    })

    const requestBody = toSnakeDeep({
      searchHistory: { stationIds },
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, '検索履歴の保存に失敗しました')

    const json = await response.json()
    const data = toCamelDeep(json.data) as { id: number }

    return {
      success: true,
      data: {
        searchHistoryId: data.id,
      },
    }
  }
  catch (error) {
    logger(error, {
      component: 'saveSearchHistory',
      extra: { stationIds },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
