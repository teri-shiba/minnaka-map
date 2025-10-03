'use server'

import type { ApiResponse } from '~/types/api-response'
import type { ServiceResult } from '~/types/service-result'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { handleApiError } from '~/utils/error-map'
import { apiFetchAuth } from './api-client'

// TODO: 他で使用されているので外に出す
export interface SharedListData {
  shareUuid: string
  title: string
  isExisting: boolean
}

export async function createSharedList(searchHistoryId: number): Promise<ServiceResult<SharedListData>> {
  try {
    const response = await apiFetchAuth<ApiResponse<SharedListData>>(
      'shared_favorite_lists',
      {
        method: 'POST',
        body: { searchHistoryId },
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
