'use server'

import type { ApiResponse } from '~/types/api-response'
import type { ServiceResult } from '~/types/service-result'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetchAuth, handleApiError } from './api-client'

export interface SharedListData {
  share_uuid: string
  title: string
  is_existing: boolean
}

export async function createSharedList(searchHistoryId: number): Promise<ServiceResult<SharedListData>> {
  try {
    const response = await apiFetchAuth<ApiResponse<SharedListData>>(
      'shared_lists',
      {
        method: 'POST',
        body: {
          search_history_id: searchHistoryId,
        },
      },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response), cause: 'REQUEST_FAILED' }

    return { success: true, data: response.data }
  }
  catch (error) {
    return handleApiError(error, {
      component: 'createSharedList',
      defaultMessage: 'シェアリストの作成に失敗しました',
      extraContext: { searchHistoryId },
    })
  }
}
