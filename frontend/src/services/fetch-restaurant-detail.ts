import type { HotPepperRestaurant, RestaurantDetailItem } from '~/types/restaurant'
import { redirect } from 'next/navigation'
import { logger } from '~/lib/logger'
import { transformToDetail } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

export async function fetchRestaurantDetail(id: string): Promise<RestaurantDetailItem> {
  try {
    const apiKey = await getApiKey('hotpepper')
    const hotpepperUrl = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

    const searchParams = new URLSearchParams({
      key: apiKey,
      id,
      format: 'json',
    })

    const response = await fetch(`${hotpepperUrl}?${searchParams}`, {
      next: {
        revalidate: 86400,
        tags: [`restaurant-detail-${id}`],
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
        throw new Error('レストラン詳細データの取得に失敗しました')
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
