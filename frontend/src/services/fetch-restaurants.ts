import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import { CACHE_DURATION } from '~/constants'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

interface ServiceSuccess<T> { success: true, data: T }
interface ServiceFailure {
  success: false
  message: string
  cause?: 'RATE_LIMIT' | 'SERVER_ERROR' | 'REQUEST_FAILED' | 'NETWORK'
}
type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

type NonEmptyArray<T> = [T, ...T[]]

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  genre?: string
  page?: number
  itemsPerPage?: number
}

interface FetchRestaurantsByIds {
  restaurantIds: NonEmptyArray<string>
  offset?: number
  limit?: number
}

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
      },
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

    // HotPepper: id 指定は 1 リクエスト最大 20 件
    const CHUNK_SIZE = 20
    const chunkCount = Math.ceil(slicedIds.length / CHUNK_SIZE)
    const chunks = Array.from({ length: chunkCount }, (_, i) => {
      const startIndex = i * CHUNK_SIZE
      const endIndex = startIndex + CHUNK_SIZE
      return (slicedIds.slice(startIndex, endIndex))
    })

    const perChunkResults = await Promise.all(
      chunks.map(async (chunkIds) => {
        if (chunkIds.length === 0)
          return { ok: true as const, items: [] as HotPepperRestaurant[], chunkIds }

        const params: Record<string, string> = {
          key: apiKey,
          id: chunkIds.join(','),
          count: String(chunkIds.length),
          format: 'json',
        }

        const searchParams = new URLSearchParams(params)

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL}/?${searchParams.toString()}`, {
            next: {
              revalidate: CACHE_DURATION.RESTAURANT_INFO,
              tags: ['hotpepper:restaurants:by-ids'],
            },
          })

          if (!response.ok)
            return { ok: false as const, status: response.status, chunkIds }

          const data = await response.json()
          const restaurants: HotPepperRestaurant[] = data?.results?.shop ?? []
          return { ok: true as const, items: restaurants, chunkIds }
        }
        catch {
          return { ok: false as const, status: 0, chunkIds } // 0 = ネットワーク層
        }
      }),
    )

    const succeeded = perChunkResults.filter(result => result.ok) as Array<{ ok: true, items: HotPepperRestaurant[], chunkIds: string[] }>
    const failed = perChunkResults.filter(result => !result.ok) as Array<{ ok: false, status: number, chunkIds: string[] }>

    if (succeeded.length === 0) {
      const statusList = failed.map(f => f.status)
      const cause: ServiceFailure['cause']
        = statusList.includes(429)
          ? 'RATE_LIMIT'
          : statusList.some(status => status >= 500)
            ? 'SERVER_ERROR'
            : statusList.some(status => status > 0)
              ? 'REQUEST_FAILED'
              : 'NETWORK'

      logger(new Error(`HotPepper API (by ids) all failed`), {
        tags: { component: 'fetchRestaurantsByIds', statusList, slicedIds },
      })

      return {
        success: false,
        message: cause === 'RATE_LIMIT'
          ? 'HotPepper API のレート制限に達しました'
          : cause === 'SERVER_ERROR'
            ? 'HotPepper API サーバーエラーが発生しました'
            : '店舗情報の取得に失敗しました',
        cause,
      }
    }

    const allRestaurants = succeeded.flatMap(result => result.items)

    const orderById = new Map<string, number>()
    slicedIds.forEach((id, index) => orderById.set(id, index))

    const items = allRestaurants
      .map(transformToList)
      .sort((leftItem, rightItem) => (orderById.get(leftItem.id)! - orderById.get(rightItem.id)!))

    if (items.length !== slicedIds.length) {
      logger(new Error('Some HotPepper ids were not returned'), {
        tags: { component: 'fetchRestaurantsByIds', requested: slicedIds.length, returned: items.length },
      })
    }

    return { success: true, data: items }
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
