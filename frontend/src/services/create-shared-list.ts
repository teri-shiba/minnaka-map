'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'

export interface SharedListData {
  share_uuid: string
  title: string
  is_existing: boolean
}

// TODO: fetch-restaurant.ts でも同じものを使ったので共通化を検討する
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

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response), cause: 'REQUEST_FAILED' }

    return { success: true, data: response.data }
  }
  catch (error) {
    logger(error, { tags: { component: 'createSharedList', searchHistoryId } })

    if (error instanceof TypeError)
      return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

    const message = String((error as Error)?.message ?? '')

    if (/\b404\b/.test(message))
      return { success: false, message: 'リソースが見つかりません', cause: 'NOT_FOUND' }

    if (/\b429\b/.test(message))
      return { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }

    if (/\b5\d\d\b/.test(message))
      return { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

    return { success: false, message: 'シェアリストの作成に失敗しました', cause: 'REQUEST_FAILED' }
  }
}
