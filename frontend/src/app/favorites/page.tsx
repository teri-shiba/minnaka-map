import Link from 'next/link'
import { redirect } from 'next/navigation'
import FavoritesList from '~/components/features/favorite/FavoritesList'
import Section from '~/components/layout/Section'
import { Button } from '~/components/ui/buttons/Button'
import { getFavoritesWithDetailsPaginated } from '~/services/favorite-action'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'

export default async function Favorites() {
  const authData = await getAuthFromCookie()
  if (!authData) {
    redirect('/?error=auth_required_favorites')
  }

  const favoritesResult = await getFavoritesWithDetailsPaginated(1, 3)

  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1>お気に入りリスト</h1>
      </header>
      <Section className="pt-8 md:pt-10">
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
      </Section>
    </>
  )
}
