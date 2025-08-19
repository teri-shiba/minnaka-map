'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { apiFetch } from './api-client'

export interface SharedListData {
  share_uuid: string
  title: string
  is_existing: boolean
}

// TODO: // TODO: fetch-restaurant.ts でも同じものを使ったので共通化を検討する
interface ServiceSuccess<T> { success: true, data: T }
interface ServiceFailure {
  success: false
  message: string
  cause?: 'NOT_FOUND' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'REQUEST_FAILED' | 'NETWORK'
}
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

export async function createSharedList(searchHistoryId: number): Promise<ServiceResult<SharedListData>> {
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
