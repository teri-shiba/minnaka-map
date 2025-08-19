'use server'

import type { ApiResponse } from '~/types/api-response'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
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

// TODO: fetch-restaurant.ts でも同じものを使ったので共通化を検討する
interface ServiceSuccess<T> { success: true, data: T }
interface ServiceFailure {
  success: false
  message: string
  cause?: 'NOT_FOUND' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'REQUEST_FAILED' | 'NETWORK'
}
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

// TODO: shareUuid -> uuid にしたい
export async function fetchSharedList(shareUuid: string): Promise<ServiceResult<SharedListData>> {
  try {
    const response = await apiFetch<ApiResponse<SharedListData>>(
      `shared_lists/${shareUuid}`,
      'GET',
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true, data: response.data }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchSharedList', shareUuid } })

    if (error instanceof TypeError)
      return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

    const message = String((error as Error)?.message ?? '')

    if (/\b404\b/.test(message))
      return { success: false, message: 'シェアリストが見つかりません', cause: 'NOT_FOUND' }

    if (/\b429\b/.test(message))
      return { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }

    if (/\b5\d\d\b/.test(message))
      return { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

    return { success: false, message: '予期しないエラーが発生しました', cause: 'REQUEST_FAILED' }
  }
}
