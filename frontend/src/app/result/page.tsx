import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
// import RestaurantsDrawer from '~/components/ui/drawers/RestaurantsDrawer'
// import Map from '~/components/ui/map/Map'
import { fetchRestaurants } from '~/services/fetch-restaurants'
// import { getApiKey } from '~/services/get-api-key'
import { parseAndValidateCoordinates } from '~/services/parse-and-validate-coords'
// import { verifyCoordsSignature } from '~/services/verify-coords-signature'
import RestaurantList from '~/components/ui/RestaurantList'

interface ResultPageProps {
  searchParams: Promise<SearchParams & { page?: string }>
}

export default async function Result({ searchParams }: ResultPageProps) {
  // const maptilerApiKey = await getApiKey('maptiler')
  const params = await searchParams

  if (!params.lat || !params.lng || !params.signature) {
    redirect('/?error=missing_params')
  }

  const { lat, lng } = await parseAndValidateCoordinates(params)

  // const midpoint = await verifyCoordsSignature({
  //   latitude: lat,
  //   longitude: lng,
  //   signature: params.signature,
  //   expires_at: params.expires_at,
  // })

  const restaurants = await fetchRestaurants({
    latitude: lat,
    longitude: lng,
    radius: params.radius,
  })

  const currentPage = Number.parseInt(params.page || '1')
  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageRestaurants = restaurants.slice(startIndex, endIndex)
  const totalPages = Math.ceil(restaurants.length / itemsPerPage)

  return (
    <>
      <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden sm:flex">
        <div className="h-[calc(60vh-4rem)] w-full bg-orange-600 md:h-[calc(100vh-4rem)] md:w-3/5">
          {/* {(maptilerApiKey && midpoint)
            && (
              <Map
                apiKey={maptilerApiKey}
                midpoint={midpoint}
                restaurants={restaurants}
              />
            )} */}
        </div>

        {/* TODO: 検索結果の件数とスケルトンはSSRで用意しておくとレンダリングのとき自然にみえる */}
        <RestaurantList
          restaurants={currentPageRestaurants}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={restaurants.length}
        />
      </div>

    </>
  )
}
