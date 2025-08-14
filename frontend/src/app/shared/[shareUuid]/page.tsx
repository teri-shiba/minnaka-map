import { notFound, redirect } from 'next/navigation'
import RestaurantCard from '~/components/features/restaurant/RestaurantCard'
import Section from '~/components/layout/Section'
import { fetchRestaurantsByIds } from '~/services/fetch-restaurants'
import { fetchSharedList } from '~/services/fetch-shared-list'

interface SharedListPageProps {
  params: { shareUuid: string }
}

export default async function SharedListPage({ params }: SharedListPageProps) {
  const sharedListResult = await fetchSharedList(params.shareUuid)

  if (!sharedListResult.success)
    notFound()

  const hotPepperId = sharedListResult.data.favorites.map(favorite => favorite.hotpepper_id)
  const restaurantsResult = await fetchRestaurantsByIds({ restaurantIds: hotPepperId })

  if (!restaurantsResult.success)
    redirect('/?error=restaurant_fetch_failed')

  const { data: sharedListData } = sharedListResult
  const restaurants = restaurantsResult.data

  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="px-5 text-lg font-bold sm:text-2xl">
          {sharedListData.title}
          のまんなかのお店
          {' '}
          {sharedListData.favorites.length}
          選
        </h1>
      </header>
      <Section className="py-8 md:py-10">
        <div className="mx-auto max-w-lg space-y-4">
          {restaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </Section>
    </>
  )
}
