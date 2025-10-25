'use server'

import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getErrorInfo } from '~/utils/get-error-info'
import { mapHotPepperErrorCode } from '~/utils/map-hotpepper-error-code'
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
    // ページネーション計算
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

    const url = new URL('/hotpepper/gourmet/v1/', process.env.HOTPEPPER_API_BASE_URL)
    url.search = new URLSearchParams(params).toString()

    const response = await fetch(url, {
      next: {
        revalidate: 86400, // 24時間 (60 * 60 * 24)
        tags: [
          'hotpepper:restaurants',
          `lat:${opts.latitude}`,
          `lng:${opts.longitude}`,
          `genre:${opts.genre ?? 'all'}`,
          `page:${page}`,
        ],
      },
    })

    const data = await response.json()

    if (data?.results?.error) {
      const errorCode = data.results.error[0]?.code ?? 3000
      const httpStatus = mapHotPepperErrorCode(errorCode)
      throw new HttpError(httpStatus, '店舗情報を取得できませんでした')
    }

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
    logger(error, {
      component: 'fetchRestaurantsByCoords',
      extra: {
        latitude: opts.latitude,
        longitude: opts.longitude,
        genre: opts.genre,
        page: opts.page,
      },
    })

    const errorInfo = await getErrorInfo({ error })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
