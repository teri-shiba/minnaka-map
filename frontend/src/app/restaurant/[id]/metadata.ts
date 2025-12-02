import type { Metadata } from 'next'
import type { RestaurantDetailPageProps } from './page'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'

export async function generateMetadata({
  params,
}: RestaurantDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await fetchRestaurantDetail(id)

  if (!result.success)
    return { title: '店舗が見つかりません' }

  const { data } = result
  const title = `${data.name}｜みんなかマップ`
  const description = `${data.name}(${data.address})の店舗情報をチェック！`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'みんなかマップ',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
