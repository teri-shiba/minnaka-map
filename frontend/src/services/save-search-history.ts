'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { apiFetch } from './api-client'

export async function saveSearchHistory(
  stationIds: number[],
): Promise<ApiResponse<{ searchHistoryId: number | null }>> {
  try {
    const result = await apiFetch<ApiResponse<{ id: number }>>(
      'search_histories',
      'POST',
      { search_history: { station_ids: stationIds } },
    )

    if (!result.success) {
      return {
        success: false,
        data: { searchHistoryId: null },
        message: result.message,
      }
    }

    return {
      success: true,
      data: { searchHistoryId: result.data.id },
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'api-client' } })
    return {
      success: false,
      data: { searchHistoryId: null },
      message: '予期しないエラーが発生しました',
    }
  }
}
