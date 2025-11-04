'use server'

import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { getErrorInfo } from '~/utils/get-error-info'

interface Midpoint {
  readonly midpoint: {
    readonly lat: string
    readonly lng: string
  }
  readonly sig: string
  readonly exp: string
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

    return {
      success: true,
      data: json.data,
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
