import type { PaginatedResult } from '~/types/pagination'
import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import { redirect } from 'next/navigation'
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

export async function fetchRestaurants(
  opts: FetchRestaurantsOpts,
): Promise<PaginatedResult<RestaurantListItem>> {
  try {
    const page = opts.page || 1
    const itemsPerPage = Math.min(opts.itemsPerPage || 10, 100)
    const start = (page - 1) * itemsPerPage + 1

    const apiKey = await getApiKey('hotpepper')

    const params: Record<string, string> = {
      key: apiKey,
      lat: opts.latitude.toString(),
      lng: opts.longitude.toString(),
      range: '5',
      start: start.toString(),
      count: itemsPerPage.toString(),
      format: 'json',
    }

    if (opts.genre) {
      params.genre = opts.genre
    }

    const searchParams = new URLSearchParams(params)
    const response = await fetch(`${process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL}?${searchParams}`, {
      next: {
        revalidate: CACHE_DURATION.RESTAURANT_INFO,
        tags: [`restaurants-${opts.latitude}-${opts.longitude}-${opts.genre || 'all'}`],
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        logger(
          new Error(`HotPepper API rate limit exceeded: ${response.status}`),
          { tags: { component: 'fetchRestaurants' } },
        )
        redirect('/?error=rate_limit_exceeded')
      }
      else if (response.status >= 500) {
        logger(
          new Error(`HotPepper API server error: response.status >= 500`),
          { tags: { component: 'fetchRestaurants' } },
        )
        redirect('/?error=server_error')
      }
      else {
        logger(
          new Error(`HotPepper API request failed: !response.ok`),
          { tags: { component: 'fetchRestaurants' } },
        )
        redirect('/?error=restaurant_fetch_failed')
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
