import type { HotPepperRestaurant, RestaurantDetailItem } from '~/types/restaurant'
import { redirect } from 'next/navigation'
import { CACHE_DURATION } from '~/constants'
import { logger } from '~/lib/logger'
import { transformToDetail } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

export async function fetchRestaurantDetail(id: string): Promise<RestaurantDetailItem> {
  try {
    const apiKey = await getApiKey('hotpepper')
    const searchParams = new URLSearchParams({
      key: apiKey,
      id,
      format: 'json',
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_HOTPEPPER_API_BASE_URL}/?${searchParams}`, {
      next: {
        revalidate: CACHE_DURATION.RESTAURANT_INFO,
        tags: [`restaurant-detail-${id}`],
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        logger(
          new Error(`HotPepper API rate limit exceeded: ${response.status}`),
          { tags: { component: 'fetchRestaurantDetail' } },
        )
        redirect('/?error=rate_limit_exceeded')
      }
      else if (response.status >= 500) {
        logger(
          new Error(`HotPepper API server error: response.status >= 500`),
          { tags: { component: 'fetchRestaurantDetail' } },
        )
        redirect('/?error=server_error')
      }
      else {
        logger(
          new Error(`HotPepper API request failed: !response.ok`),
          { tags: { component: 'fetchRestaurantDetail' } },
        )
        redirect('/?error=restaurant_fetch_failed')
      }
    }

    const data = await response.json()
    const restaurants: HotPepperRestaurant[] = data.results.shop || []

    if (restaurants.length === 0) {
      redirect('/?error=restaurant_not_found')
    }

    const restaurant = restaurants[0]
    return transformToDetail(restaurant)
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchRestaurantDetail' } })
    redirect('/?error=restaurant_fetch_failed')
  }
}
