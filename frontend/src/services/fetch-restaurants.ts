import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import { CACHE_DURATION } from '~/constants'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  genre?: string
  page?: number
  itemsPerPage?: number
}

interface FetchRestaurantsByIds {
  restaurantIds: string[]
  latitude?: number
  longitude?: number
  offset?: number
  limit?: number
}

interface ServiceSuccess<T> { success: true, data: T }
interface ServiceFailure {
  success: false
  message: string
  cause?: 'RATE_LIMIT' | 'SERVER_ERROR' | 'REQUEST_FAILED' | 'NETWORK'
}
type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

export async function fetchRestaurants(
  opts: FetchRestaurantsOpts,
): Promise<ServiceResult<PaginatedResult<RestaurantListItem>>> {
  try {
    const page = Math.max(1, Math.floor(opts.page ?? 1))
    const itemsPerPage = Math.min(opts.itemsPerPage ?? 10, 100)
    const start = (page - 1) * itemsPerPage + 1

    const apiKey = await getApiKey('hotpepper')

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

    const searchParams = new URLSearchParams(params)
    const response = await fetch(`${process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL}/?${searchParams}`, {
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
      const cause: ServiceFailure['cause']
        = status === 429 ? 'RATE_LIMIT' : status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED'

      logger(
        new Error(`HotPepper API request failed: ${status}`),
        { tags: { component: 'fetchRestaurants', statusCode: status } },
      )

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
      }
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchRestaurants' } })
    return {
      success: false,
      message: 'ネットワークエラーが発生しました',
      cause: 'NETWORK',
    }
  }
}

export async function fetchRestaurantsByIds(
  opts: FetchRestaurantsByIds,
): Promise<ServiceResult<RestaurantListItem[]>> {
  try {
    const { restaurantIds, offset = 0, limit } = opts

    const slicedIds = limit === undefined
      ? restaurantIds.slice(offset)
      : restaurantIds.slice(offset, offset + limit)

    if (slicedIds.length === 0)
      return { success: true, data: [] }

    const apiKey = await getApiKey('hotpepper')
    const requestCount = Math.min(opts.restaurantIds.length, 100)

    const params: Record<string, string> = {
      key: apiKey,
      id: ids.join(','),
      count: requestCount.toString(),
      format: 'json',
    }

    if (opts.latitude && opts.longitude) {
      params.lat = String(opts.latitude)
      params.lng = String(opts.longitude)
    }

    const searchParams = new URLSearchParams(params)
    const response = await fetch(`${process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL}/?${searchParams}`, {
      next: {
        revalidate: CACHE_DURATION.RESTAURANT_INFO,
        tags: ['hotpepper:restaurants-by-ids', `ids:${ids.join('-')}`],
      },
    })

    if (!response.ok) {
      const status = response.status
      logger(new Error(`HotPepper API (by ids) failed: ${status}`), {
        tags: { component: 'fetchRestaurantsByIds', statusCode: status, ids },
      })

      return {
        success: false,
        message: `店舗情報の取得に失敗しました (HTTP ${status})`,
        cause: status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED',
      }
    }

    const data = await response.json()
    const restaurants: HotPepperRestaurant[] = data.results.shop || []

    return { success: true, data: restaurants.map(transformToList) }
  }
  catch (error) {
    logger(error, {
      tags: {
        component: 'fetchRestaurantsByIds',
        ids: opts.restaurantIds,
      },
    })
    return {
      success: false,
      message: 'ネットワークエラーが発生しました',
      cause: 'NETWORK',
    }
  }
}
