'use server'

import type { HotPepperRestaurant, RestaurantDetailItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { transformToDetail } from '~/types/restaurant'
import { getErrorInfo } from '~/utils/get-error-info'
import { mapHotPepperErrorCode } from '~/utils/map-hotpepper-error-code'
import { getApiKey } from './get-api-key'

export async function fetchRestaurantDetail(
  id: string,
): Promise<ServiceResult<RestaurantDetailItem>> {
  try {
    const result = await getApiKey('hotpepper')
    if (!result.success) {
      return {
        success: false,
        message: result.message,
        cause: result.cause,
      }
    }

    const apiKey = result.data
    const url = new URL('/hotpepper/gourmet/v1/', process.env.HOTPEPPER_API_BASE_URL)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('id', id)
    url.searchParams.set('format', 'json')

    const response = await fetch(url, {
      next: {
        revalidate: 86400, // 24時間 (60 * 60 * 24)
        tags: ['hotpepper:restaurant-detail', `id:${id}`],
      },
    })

    const data = await response.json()

    if (data?.results?.error) {
      const errorCode = data.results.error[0]?.code ?? 3000
      const httpStatus = mapHotPepperErrorCode(errorCode)
      throw new HttpError(httpStatus, '店舗情報を取得できませんでした')
    }

    const shops: HotPepperRestaurant[] = data?.results?.shop ?? []

    if (shops.length === 0) {
      return {
        success: false,
        message: '店舗が見つかりませんでした',
        cause: 'NOT_FOUND',
      }
    }

    return { success: true, data: transformToDetail(shops[0]) }
  }
  catch (error) {
    logger(error, {
      component: 'fetchRestaurantDetail',
      extra: { id },
    })

    const errorInfo = getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
