'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { toCamelDeep } from '~/utils/case-convert'
import { getErrorInfo } from '~/utils/get-error-info'

interface Midpoint {
  readonly midpoint: {
    readonly latitude: string
    readonly longitude: string
  }
  readonly signature?: string
  readonly expiresAt?: string
}

export async function getMidpoint(
  stationIds: number[],
): Promise<ServiceResult<Midpoint>> {
  try {
    const url = new URL('/api/v1/midpoint', process.env.API_BASE_URL)

    stationIds.forEach((id) => {
      url.searchParams.append('station_ids[]', String(id))
    })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 86400, // 24時間 (60 * 60 * 24)
        tags: ['midpoint'],
      },
    })

    if (!response.ok)
      throw new HttpError(response.status, '中間地点の計算に失敗しました')

    const json = await response.json()
    const data = toCamelDeep(json.data)

    return {
      success: true,
      data,
    }
  }
  catch (error) {
    logger(error, {
      component: 'postMidpoint',
      extra: { stationIds },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
