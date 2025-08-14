'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { apiFetch } from './api-client'

export interface SharedListData {
  share_uuid: string
  title: string
}

interface CreateSharedListResponse {
  success: boolean
  data?: SharedListData
  message?: string
}

export async function createSharedList(searchHistoryId: number): Promise<CreateSharedListResponse> {
  try {
    const response = await apiFetch<ApiResponse<SharedListData>>(
      'shared_lists',
      'POST',
      { search_history_id: searchHistoryId },
    )

    if (!response.success) {
      return { success: false, message: response.message || 'シェアリストの作成に失敗しました' }
    }

    return {
      success: true,
      data: response.data,
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'createSharedList' } })
    return { success: false, message: '予期しないエラーが発生しました' }
  }
}
