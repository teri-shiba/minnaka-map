import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
import RestaurantsDrawer from '~/components/ui/drawers/RestaurantsDrawer'
import { fetchRestaurants } from '~/services/fetch-restaurants'
import { getApiKey } from '~/services/get-api-key'
import { parseAndValidateCoordinates } from '~/services/parse-and-validate-coords'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'

interface ResultPageProps {
  searchParams: SearchParams
}

export default async function Result({ searchParams }: ResultPageProps) {
  const maptilerApiKey = await getApiKey('maptiler')
  const params = await searchParams

  if (!params.lat || !params.lng || !params.signature) {
    redirect('/?error=missing_params')
  }

  const { lat, lng } = await parseAndValidateCoordinates(params)

  const userLocation = await verifyCoordsSignature({
    latitude: lat,
    longitude: lng,
    signature: params.signature,
    expires_at: params.expires_at,
  })

  const restaurants = await fetchRestaurants({
    latitude: lat,
    longitude: lng,
    radius: params.radius,
  })

  return (
    <>
      <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden sm:flex">
        <div className="h-[calc(60vh-4rem)] w-full bg-orange-600 md:h-[calc(100vh-4rem)] md:w-3/5">
          {/* {(maptilerApiKey && userLocation)
            && (
              <Map
                apiKey={maptilerApiKey}
                userLocation={userLocation}
              />
            )} */}
        </div>

        {/* PC */}
        {/* <div className="p-6 max-h-dvh overflow-y-scroll hidden-scrollbar md:w-2/5">
          {restaurants.map(item => (
            <RestaurantCard
              key={item.name}
              id={item.id}
              name={item.name}
              genre={item.genre.name}
              address={item.address}
              station={item.station_name}
              open={item.open}
              close={item.close}
              card={item.card}
              access={item.mobile_access} // 店によって違うから一覧ではいらんかも
              url={item.urls.pc} // ホットペッパーのURL
              imageUrl={item.photo.mobile.l}
              privateRoom={item.private_room}
              budget={item.budget.average}
              capacity={item.capacity}
            />
          ))}
        </div> */}

        {/* SP */}
        <RestaurantsDrawer
          restaurants={restaurants}
        />
      </div>

    </>
  )
}
