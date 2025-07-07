import type { HotPepperRestaurant, RestaurantListItem } from '~/types/restaurant'
import { redirect } from 'next/navigation'
import { logger } from '~/lib/logger'
import { transformToList } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  radius?: string
}

export async function fetchRestaurants(opts: FetchRestaurantsOpts): Promise<RestaurantListItem[]> {
  try {
    const apiKey = await getApiKey('hotpepper')
    const hotpepperUrl = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

    const searchParams = new URLSearchParams({
      key: apiKey,
      lat: opts.latitude.toString(),
      lng: opts.longitude.toString(),
      range: opts.radius || '5',
      format: 'json',
      count: '20',
    })

    const response = await fetch(`${hotpepperUrl}?${searchParams}`, {
      next: {
        revalidate: 86400,
        tags: [`restaurants-${opts.latitude}-${opts.longitude}`],
      },
    })

    if (!response.ok) {
      throw new Error('レストランデータの取得に失敗しました')
    }

    const data = await response.json()
    const restaurants: HotPepperRestaurant[] = data.results.shop || []

    if (restaurants.length === 0) {
      throw new Error('NoRestaurantsFound')
    }

    return restaurants.map(transformToList)
  }
  catch (error) {
    logger(error, { tags: { component: 'fetchRestaurants' } })
    redirect('/?error=unexpected_error')
  }
}
