'use server'

import type { ApiResponse } from '~/types/api-response'
import type { ServiceResult } from '~/types/service-result'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch, handleApiError } from './api-client'

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

export async function fetchSharedList(uuid: string): Promise<ServiceResult<SharedListData>> {
  try {
    const response = await apiFetch<ApiResponse<SharedListData>>(
      `shared_lists/${uuid}`,
      'GET',
      { withAuth: false },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response), cause: 'REQUEST_FAILED' }

    return { success: true, data: response.data }
  }
  catch (error) {
    return handleApiError(error, {
      component: 'fetchSharedList',
      defaultMessage: '予期しないエラーが発生しました',
      notFoundMessage: 'シェアリストが見つかりません',
      extraContext: { uuid },
    })
  }
}
