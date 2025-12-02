import type { Metadata } from 'next'
import type { SharedListPageProps } from './page'
import { fetchSharedList } from '~/services/fetch-shared-list'

export async function generateMetadata({
  params,
}: SharedListPageProps): Promise<Metadata> {
  const { shareUuid } = await params
  const result = await fetchSharedList(shareUuid)

  if (!result.success) {
    return {
      title: 'お気に入りの飲食店まとめ｜みんなかマップ',
      description: '中心エリアに紐づくお気に入り飲食店をまとめた共有用リストです。みんなかマップで保存されたお店を一覧で確認できます。',
    }
  }

  const { data } = result
  const stations = data.searchHistory.stationNames.join('・')
  const count = data.favorites.length

  if (stations.length === 0) {
    return {
      title: `お気に入りの飲食店${count}選｜みんなかマップ`,
      description: `中心エリアに紐づくお気に入り飲食店${count}店をまとめた共有用リストです。みんなかマップで保存されたお店を一覧で確認できます。`,
    }
  }

  const title = `${stations}のまんなかのお店${count}選｜みんなかマップ`
  const description = `出発駅（${stations}）から算出した中心エリアを基点に、登録されたお気に入り飲食店を一覧で紹介。このページは、みんなかマップで作成されたお気に入り飲食店の共有用リストです。`

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
      card: 'summary',
      title,
      description,
    },
  }
}
