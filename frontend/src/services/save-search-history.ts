'use server'

import type { ServiceResult } from '~/types/service-result'
import { ApiError } from '~/lib/api-error'
import { logger } from '~/lib/logger'
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

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        search_history: { station_ids: stationIds },
      }),
      cache: 'no-cache',
    })

    if (!response.ok) {
      throw new ApiError(response.status, '検索履歴の保存に失敗しました')
    }

    const json = await response.json()
    return {
      success: true,
      data: { searchHistoryId: json.data.id },
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
