import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import { redirect } from 'next/navigation'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  radius?: string
  page?: number
  itemsPerPage?: number
}

export async function fetchRestaurants(
  opts: FetchRestaurantsOpts,
): Promise<PaginatedResult<RestaurantListItem>> {
  try {
    const page = opts.page || 1
    const itemsPerPage = Math.min(opts.itemsPerPage || 10, 100)
    const start = (page - 1) * itemsPerPage + 1

    const apiKey = await getApiKey('hotpepper')
    const hotpepperUrl = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

    const searchParams = new URLSearchParams({
      key: apiKey,
      lat: opts.latitude.toString(),
      lng: opts.longitude.toString(),
      range: opts.radius || '5',
      start: start.toString(),
      count: itemsPerPage.toString(),
      format: 'json',
    })

    const response = await fetch(`${hotpepperUrl}?${searchParams}`, {
      next: {
        revalidate: 86400,
        tags: [`restaurants-${opts.latitude}-${opts.longitude}`],
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        redirect('/?error=rate_limit_exceeded')
      }
      else if (response.status >= 500) {
        redirect('/?error=server_error')
      }
      else {
        throw new Error('レストランデータの取得に失敗しました')
      }
    }

    const data = await response.json()
    const restaurants: HotPepperRestaurant[] = data.results.shop || []
    const totalCount = Number(data.results.results_available) || 0
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const transformedRestaurants = restaurants.map(transformToList)

    if (restaurants.length === 0) {
      return {
        items: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          itemsPerPage,
        },
        hasMore: false,
      }
    }

    return {
      items: transformedRestaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        itemsPerPage,
      },
      hasMore: page < totalPages,
    }
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchRestaurants' } })
    redirect('/?error=restaurant_fetch_failed')
  }
}
