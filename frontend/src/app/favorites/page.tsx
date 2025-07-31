import { redirect } from 'next/navigation'
import RestaurantCard from '~/components/features/restaurant/RestaurantCard'
import Section from '~/components/layout/Section'
import { getFavoritesWithDetails } from '~/services/favorite-action'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'

export default async function Favorites() {
  const authData = await getAuthFromCookie()
  if (!authData) {
    redirect('/?error=auth_required_favorites')
  }

  const favoritesResult = await getFavoritesWithDetails()

  return (
    <>
      <header className="flex h-36 flex-col items-center justify-center bg-secondary md:h-48">
        <h1>お気に入りリスト</h1>
      </header>
      <Section className="pt-8 md:pt-10">
        <div className="mx-auto max-w-lg">
          {favoritesResult.success
            ? (
                favoritesResult.data.length > 0
                  ? (
                      favoritesResult.data.map(group => (
                        <section key={group.searchHistory.id}>
                          <h2 className="text-center">
                            {group.searchHistory.stationNames.join('・')}
                          </h2>
                          <div className="mb-6 space-y-4 border-b py-6 md:mb-10 md:py-10">
                            {group.favorites.map(favorite => (
                              <RestaurantCard
                                key={favorite.id}
                                restaurant={favorite.restaurant}
                                favoriteId={favorite.id}
                                showFavoriteButton={true}
                              />
                            ))}
                          </div>
                        </section>
                      ))
                    )
                  : (
                      <div className="">
                        <p>まだお気に入りが登録されていません</p>
                        <p>レストラン検索からお気に入りを追加してみよう</p>
                      </div>
                    )
              )
            : (
                // TODO: エラーハンドリングを再検討
                <div className="">
                  <p>お気に入り一覧の取得に失敗しました</p>
                  <p>{favoritesResult.message}</p>
                </div>
              )}
        </div>
      </Section>
    </>
  )
}
