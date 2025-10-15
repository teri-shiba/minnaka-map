'use server'

import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import type { ServiceCause, ServiceResult } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { externalHref } from '~/utils/external-url'
import { getApiKey } from './get-api-key'

type NonEmptyArray<T> = [T, ...T[]]

interface FetchRestaurantsByIds {
  restaurantIds: NonEmptyArray<string>
  offset?: number
  limit?: number
}

// HotPepper: id 指定は 1 リクエスト最大 20 件
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

    const result = await getApiKey('hotpepper')
    if (!result.success) {
      return {
        success: false,
        message: result.message,
        cause: result.cause,
      }
    }

    const apiKey = result.data

    const CHUNK_SIZE = 20

    const chunkCount = Math.ceil(slicedIds.length / CHUNK_SIZE)
    const chunks = Array.from({ length: chunkCount }, (_, i) => {
      const startIndex = i * CHUNK_SIZE
      const endIndex = startIndex + CHUNK_SIZE
      return slicedIds.slice(startIndex, endIndex)
    })

    const perChunkResults = await Promise.all(
      chunks.map(async (chunkIds) => {
        if (chunkIds.length === 0)
          return { ok: true as const, items: [] as HotPepperRestaurant[], chunkIds }

        const params = new URLSearchParams({
          key: apiKey,
          id: chunkIds.join(','),
          count: String(chunkIds.length),
          format: 'json',
        })

        try {
          const url = externalHref(
            process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL,
            '/hotpepper/gourmet/v1/',
            params,
          )

          const response = await fetch(url, {
            next: {
              revalidate: 86400, // 24時間 (60 * 60 * 24)
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

    const succeeded = perChunkResults.filter(result => result.ok) as Array<{
      ok: true
      items: HotPepperRestaurant[]
      chunkIds: string[]
    }>

    const failed = perChunkResults.filter(result => !result.ok) as Array<{
      ok: false
      status: number
      chunkIds: string[]
    }>

    if (succeeded.length === 0) {
      const statusList = failed.map(f => f.status)
      const cause: ServiceCause
        = statusList.includes(429)
          ? 'RATE_LIMIT'
          : statusList.some(status => status >= 500)
            ? 'SERVER_ERROR'
            : statusList.some(status => status > 0)
              ? 'REQUEST_FAILED'
              : 'NETWORK'

      logger(new Error(`HotPepper API (by ids) all failed`), {
        component: 'fetchRestaurantsByIds',
        extra: {
          statusList,
          slicedIds,
        },
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
      .sort(
        (leftItem, rightItem) =>
          (orderById.get(leftItem.id)! - orderById.get(rightItem.id)!),
      )

    if (items.length !== slicedIds.length) {
      logger(new Error('Some HotPepper ids were not returned'), {
        component: 'fetchRestaurantsByIds',
        extra: {
          requested: slicedIds.length,
          returned: items.length,
        },
      })
    }

    return { success: true, data: items }
  }
  catch (error) {
    logger(error, {
      component: 'fetchRestaurantsByIds',
      extra: { ids: opts.restaurantIds },
    })
    return {
      success: false,
      message: 'ネットワークエラーが発生しました',
      cause: 'NETWORK',
    }
  }
}
