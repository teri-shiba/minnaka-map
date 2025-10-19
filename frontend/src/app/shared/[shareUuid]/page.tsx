import type { RestaurantListItem } from '~/types/restaurant'
import { notFound, redirect } from 'next/navigation'
import RestaurantCard from '~/components/features/restaurant/restaurant-card'
import Section from '~/components/layout/section'
import { fetchRestaurantsByIds } from '~/services/fetch-restaurants-by-ids'
import { fetchSharedList } from '~/services/fetch-shared-list'

interface SharedListPageProps {
  params: Promise<{ shareUuid: string }>
}

export default async function SharedListPage({ params }: SharedListPageProps) {
  const { shareUuid } = await params

  const result = await fetchSharedList(shareUuid)

  if (!result.success)
    notFound()

  const { data: sharedListDetail } = result
  const favoriteIds = sharedListDetail.favorites.map(f => f.hotpepperId)

  let restaurants: RestaurantListItem[] = []

  if (favoriteIds.length > 0) {
    const restaurantIds= favoriteIds as [string, ...string[]]
    const result = await fetchRestaurantsByIds(restaurantIds)

    if (!result.success)
      redirect('/?error=restaurant_fetch_failed')

    restaurants = result.data
  }

  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="px-5 text-lg font-bold sm:text-2xl">
          {sharedListDetail.title}
          のまんなかのお店
          {' '}
          {sharedListDetail.favorites.length}
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
