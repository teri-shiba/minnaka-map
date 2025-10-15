'use server'

import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import type { ServiceCause, ServiceResult } from '~/types/service-result'
import { CACHE_DURATION, EXTERNAL_ENDPOINTS } from '~/constants'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { externalHref } from '~/utils/external-url'
import { getApiKey } from './get-api-key'

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  genre?: string
  page?: number
  itemsPerPage?: number
}

export async function fetchRestaurantsByCoords(
  opts: FetchRestaurantsOpts,
): Promise<ServiceResult<PaginatedResult<RestaurantListItem>>> {
  try {
    const page = Math.max(1, Math.floor(opts.page ?? 1))
    const itemsPerPage = Math.min(opts.itemsPerPage ?? 10, 100)
    const start = (page - 1) * itemsPerPage + 1

    const result = await getApiKey('hotpepper')
    if (!result.success) {
      return {
        success: false,
        message: result.message,
        cause: result.cause,
      }
    }

    const apiKey = result.data
    const params: Record<string, string> = {
      key: apiKey,
      lat: String(opts.latitude),
      lng: String(opts.longitude),
      range: '5', // 3000m
      start: String(start),
      count: String(itemsPerPage),
      format: 'json',
    }

    if (opts.genre)
      params.genre = opts.genre

    const url = externalHref(
      process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL,
      EXTERNAL_ENDPOINTS.HOTPEPPER_GOURMET_V1,
      params,
    )

    const response = await fetch(url, {
      next: {
        revalidate: CACHE_DURATION.RESTAURANT_INFO,
        tags: [
          'hotpepper:restaurants',
          `lat:${opts.latitude}`,
          `lng:${opts.longitude}`,
          `genre:${opts.genre ?? 'all'}`,
          `page:${page}`,
        ],
      },
    })

    if (!response.ok) {
      const status = response.status
      const cause: ServiceCause
        = status === 429 ? 'RATE_LIMIT' : status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED'

      logger(new Error(`HotPepper API request failed: ${status}`), {
        component: 'fetchRestaurants',
      })

      return {
        success: false,
        message:
        cause === 'RATE_LIMIT'
          ? 'HotPepper API のレート制限に達しました'
          : cause === 'SERVER_ERROR'
            ? 'HotPepper API サーバーエラーが発生しました'
            : '店舗情報の取得に失敗しました',
        cause,
      }
    }

    const data = await response.json()
    const restaurants: HotPepperRestaurant[] = data?.results?.shop ?? []
    const totalCount = Number(data?.results?.results_available ?? 0) || 0
    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return {
      success: true,
      data: {
        items: restaurants.map(transformToList),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          itemsPerPage,
        },
        hasMore: page < totalPages,
      },
    }
  }
  catch (error) {
    logger(error, { component: 'fetchRestaurants' })
    return {
      success: false,
      message: 'ネットワークエラーが発生しました',
      cause: 'NETWORK',
    }
  }
}
