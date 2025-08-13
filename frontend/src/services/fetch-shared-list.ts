'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { apiFetch } from './api-client'

interface SharedListData {
  title: string
  created_at: string
  search_history: {
    id: number
    station_names: string[]
  }
  favorites: Array<{
    id: number
    hotpepper_id: string
  }>
}

interface SharedListResponse {
  success: boolean
  data: SharedListData
  message?: string
}

export async function fetchSharedList(shareUuid: string): Promise<SharedListResponse> {
  try {
    const response = await apiFetch<ApiResponse<SharedListData>>(
      `shared_lists/${shareUuid}`,
      'GET',
    )

    if (!response.success) {
      return {
        success: false,
        data: {} as SharedListData,
        message: response.message || 'データの取得に失敗しました',
      }
    }

    return { success: true, data: response.data }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchSharedList' } })

    const errorMessage = error instanceof Error && error.message.includes('404')
      ? 'シェアリストが見つかりません'
      : '予期しないエラーが発生しました'

    return {
      success: false,
      data: {} as SharedListData,
      message: errorMessage,
    }
  }
}
