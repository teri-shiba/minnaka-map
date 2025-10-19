'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'

interface SharedListDetail {
  title: string
  createdAt: string
  searchHistory: {
    id: number
    stationNames: string[]
  }
  favorites: Array<{
    id: number
    hotpepperId: string
  }>
}

export async function fetchSharedList(
  uuid: string,
): Promise<ServiceResult<SharedListDetail>> {
  try {
    const url = new URL(
      `/api/v1/shared_favorite_lists/${uuid}`,
      process.env.API_BASE_URL,
    )

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, 'この店舗リストは存在しないか、削除されています')

    const json = await response.json()
    const data = toCamelDeep(json.data)

    return {
      success: true,
      data,
    }
  }
  catch (error) {
    logger(error, {
      component: 'fetchSharedList',
      extra: { uuid },
    })

    const errorInfo = getErrorInfo({
      error,
      notFoundErrorMessage: 'シェアリストが見つかりません',
    })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
