import Link from 'next/link'
import FavoritesList from '~/components/features/favorite/favorite-list'
import { Button } from '~/components/ui/button'
import { fetchFavoriteGroups } from '~/services/fetch-favorite-groups'

export default async function Favorites() {
  // 初期表示（1ページ目）
  const favoritesResult = await fetchFavoriteGroups()

  return (
    <div className="mx-auto max-w-lg">
      {favoritesResult.success
        ? (
            <FavoritesList
              initialData={favoritesResult.data.groups}
              initialMeta={favoritesResult.data.pagination}
            />
          )
        : (
            <div className="my-10 text-center">
              <h2 className="mb-2">お気に入りを読み込めませんでした。</h2>
              <p className="mb-6">時間をあけてから、再度お試しください。</p>
              <Button asChild size="lg">
                <Link href="/">トップページに戻る</Link>
              </Button>
            </div>
          )}
    </div>
  )
}
