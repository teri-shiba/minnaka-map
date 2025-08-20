'use server'

import type { ApiResponse } from '~/types/api-response'
import type { ServiceResult } from '~/types/service-result'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch, handleApiError } from './api-client'

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
    return handleApiError(error, {
      component: 'saveSearchHistory',
      defaultMessage: '検索履歴の保存に失敗しました',
      extraContext: { stationIds },
    })
  }
}
