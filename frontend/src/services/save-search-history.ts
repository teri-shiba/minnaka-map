'use server'

import type { ApiResponse } from '~/types/api-response'
import type { ServiceResult } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'

export async function saveSearchHistory(
  stationIds: number[],
): Promise<ServiceResult<{ searchHistoryId: number | null }>> {
  try {
    const response = await apiFetch<ApiResponse<{ id: number }>>(
      'search_histories',
      'POST',
      { search_history: { station_ids: stationIds } },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response), cause: 'REQUEST_FAILED' }

    return {
      success: true,
      data: { searchHistoryId: response.data.id },
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'saveSearchHistory', stationIds } })

    if (error instanceof TypeError)
      return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

    const message = String((error as Error)?.message ?? '')

    if (/\b404\b/.test(message))
      return { success: false, message: 'リソースが見つかりません', cause: 'NOT_FOUND' }

    if (/\b429\b/.test(message))
      return { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }

    if (/\b5\d\d\b/.test(message))
      return { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

    return { success: false, message: '検索履歴の保存に失敗しました', cause: 'REQUEST_FAILED' }
  }
}
