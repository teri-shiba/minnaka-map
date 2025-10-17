'use server'

import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getErrorInfo } from '~/utils/get-error-info'
import { mapHotPepperErrorCode } from '~/utils/map-hotpepper-error-code'
import { getApiKey } from './get-api-key'

type NonEmptyArray<T> = [T, ...T[]]

interface ChunkSuccess { success: true, items: HotPepperRestaurant[] }
interface ChunkFailure { success: false, status: number }
type ChunkResult = ChunkSuccess | ChunkFailure

// HotPeeper の最大同時リクエスト数 (20件) に合わせて分割
function splitIntoChunks(array: string[]): string[][] {
  const CHUNK_SIZE = 20
  const chunkCount = Math.ceil(array.length / CHUNK_SIZE)

  return Array.from({ length: chunkCount }, (_, i) => {
    const startIndex = i * CHUNK_SIZE
    const endIndex = startIndex + CHUNK_SIZE
    return array.slice(startIndex, endIndex)
  })
}

// 結果を集計・ソート
function collectAndSortResults(
  originalIds: string[],
  successfulChunks: ChunkSuccess[],
): RestaurantListItem[] {
  const orderById = new Map<string, number>()
  originalIds.forEach((id, index) => orderById.set(id, index))
  const allRestaurants = successfulChunks.flatMap(result => result.items)

  return allRestaurants
    .map(transformToList)
    .sort((leftItem, rightItem) => (
      orderById.get(leftItem.id)! - orderById.get(rightItem.id)!
    ))
}

export async function fetchRestaurantsByIds(
  restaurantIds: NonEmptyArray<string>,
): Promise<ServiceResult<RestaurantListItem[]>> {
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
    const chunks = splitIntoChunks(restaurantIds)

    // 並列リクエスト
    const perChunkResults: ChunkResult[] = await Promise.all(
      chunks.map(async (chunkIds): Promise<ChunkResult> => {
        try {
          const url = new URL('/hotpepper/gourmet/v1/', process.env.HOTPEPPER_API_BASE_URL)
          url.searchParams.set('key', apiKey)
          url.searchParams.set('id', chunkIds.join(','))
          url.searchParams.set('count', String(chunkIds.length))
          url.searchParams.set('format', 'json')

          const response = await fetch(url, {
            next: {
              revalidate: 86400, // 24時間 (60 * 60 * 24)
              tags: ['hotpepper:restaurants:by-ids'],
            },
          })

          const data = await response.json()

          if (data?.results?.error) {
            const errorCode = data.results.error[0]?.code ?? 3000
            const httpStatus = mapHotPepperErrorCode(errorCode)
            return {
              success: false,
              status: httpStatus,
            }
          }

          const restaurants: HotPepperRestaurant[] = data?.results?.shop ?? []
          return {
            success: true,
            items: restaurants,
          }
        }
        catch {
          // 並列処理を最後まで完了させるため、ネットワークエラーのみ検知
          return {
            success: false,
            status: 0,
          }
        }
      }),
    )

    const succeeded = perChunkResults.filter(result => result.success)
    const failed = perChunkResults.filter(result => !result.success)

    if (succeeded.length === 0) {
      const firstStatus = failed[0]?.status ?? 0
      throw new HttpError(firstStatus, '店舗情報を取得できませんでした')
    }

    const items = collectAndSortResults(restaurantIds, succeeded)

    return { success: true, data: items }
  }
  catch (error) {
    logger(error, {
      component: 'fetchRestaurantsByIds',
      extra: { ids: restaurantIds },
    })

    const errorInfo = getErrorInfo({ error })
    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
