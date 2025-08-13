import { notFound, redirect } from 'next/navigation'
import RestaurantCard from '~/components/features/restaurant/RestaurantCard'
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
      <header>
        <h1>{sharedListData.title}</h1>
        <p>
          おすすめのレストラン
          {sharedListData.favorites.length}
        </p>
      </header>
      <div className="">
        {restaurants.map(restaurant => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </>
  )
}
