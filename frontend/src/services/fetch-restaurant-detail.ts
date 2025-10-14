'use server'

import type { HotPepperRestaurant, RestaurantDetailItem } from '~/types/restaurant'
import type { ServiceCause, ServiceResult } from '~/types/service-result'
import { CACHE_DURATION, EXTERNAL_ENDPOINTS } from '~/constants'
import { logger } from '~/lib/logger'
import { transformToDetail } from '~/types/restaurant'
import { externalHref } from '~/utils/external-url'
import { getApiKey } from './get-api-key'

export async function fetchRestaurantDetail(id: string): Promise<ServiceResult<RestaurantDetailItem>> {
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
    const params = new URLSearchParams({
      key: apiKey,
      id,
      format: 'json',
    })

    const url = externalHref(
      process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL,
      EXTERNAL_ENDPOINTS.HOTPEPPER_GOURMET_V1,
      params,
    )

    const response = await fetch(url, {
      next: {
        revalidate: CACHE_DURATION.RESTAURANT_INFO,
        tags: ['hotpepper:restaurant-detail', `id:${id}`],
      },
    })

    if (!response.ok) {
      const status = response.status
      const cause: ServiceCause
        = status === 429
          ? 'RATE_LIMIT'
          : status >= 500
            ? 'SERVER_ERROR'
            : 'REQUEST_FAILED'

      logger(new Error(`HotPepper detail request failed: ${status}`), {
        component: 'fetchRestaurantDetail',
        extra: { id },
      })

      return {
        success: false,
        message:
        cause === 'RATE_LIMIT'
          ? 'HotPepper API のレート制限に達しました'
          : cause === 'SERVER_ERROR'
            ? 'HotPepper API サーバーエラーが発生しました'
            : '店舗の取得に失敗しました',
        cause,
      }
    }

    const data = await response.json()
    const shops: HotPepperRestaurant[] = data?.results?.shop ?? []

    if (shops.length === 0) {
      logger(new Error('HotPepper: shop not found'), {
        component: 'fetchRestaurantDetail',
        extra: { id },
      })
      return { success: false, message: '店舗が見つかりませんでした', cause: 'NOT_FOUND' }
    }

    return { success: true, data: transformToDetail(shops[0]) }
  }
  catch (error) {
    logger(error, {
      component: 'fetchRestaurantDetail',
      extra: { id },
    })

    if (error instanceof TypeError) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました',
        cause: 'NETWORK',
      }
    }

    return {
      success: false,
      message: '店舗の取得に失敗しました',
      cause: 'REQUEST_FAILED',
    }
  }
}
