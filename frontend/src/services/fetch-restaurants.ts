import type { HotPepperRestaurant, Restaurant } from '~/types/restaurant'
import { transfromHotPepperToRestaurant } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

interface FetchRestaurantsOpts {
  latitude: number
  longitude: number
  radius?: string
}

export async function fetchRestaurants(opts: FetchRestaurantsOpts): Promise<Restaurant[]> {
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
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      throw new Error('レストランデータの取得に失敗しました')
    }

    const data = await response.json()
    const hotpepperRestaurant: HotPepperRestaurant[] = data.results.shop || []
    return hotpepperRestaurant.map(transfromHotPepperToRestaurant)
  }
  catch (error) {
    console.error('Restaurant fetch error:', error)
    return []
  }
}
