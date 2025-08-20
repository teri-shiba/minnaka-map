import Link from 'next/link'
import FavoritesList from '~/components/features/favorite/FavoritesList'
import { Button } from '~/components/ui/buttons/Button'
import { getFavoritesWithDetailsPaginated } from '~/services/favorite-action'

export default async function Favorites() {
  const favoritesResult = await getFavoritesWithDetailsPaginated(1, 3)

  return (
    <div className="mx-auto max-w-lg">
      {favoritesResult.success
        ? (
            <FavoritesList
              initialData={favoritesResult.data}
              initialMeta={favoritesResult.meta}
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
