import type { HotPepperRestaurant, Restaurant } from '~/types/restaurant'
import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
import { transfromHotPepperToRestaurant } from '~/types/restaurant'
import { getApiKey } from './get-api-key'

export async function fetchRestaurants(params: SearchParams): Promise<Restaurant[]> {
  try {
    const { lat, lng } = params

    if (!lat || !lng) {
      console.error('緯度経度が指定されていません')
      redirect('/')
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      console.error('無効な座標です')
      redirect('/')
    }

    const apiKey = await getApiKey('hotpepper')
    const hotpepperUrl = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

    const searchParams = new URLSearchParams({
      key: apiKey,
      lat: latitude.toString(),
      lng: longitude.toString(),
      range: params.radius || '5',
      format: 'json',
      count: '20',
    })

    const response = await fetch(`${hotpepperUrl}?${searchParams}`, {
      next: { revalidate: 86400 }, // ISR: 24hキャッシュ
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
