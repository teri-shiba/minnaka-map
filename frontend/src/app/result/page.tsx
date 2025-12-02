import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Map from '~/components/features/map/map'
import MapError from '~/components/features/map/map-error'
import RestaurantList from '~/components/features/restaurant/restaurant-list'
import { fetchRestaurantsByCoords } from '~/services/fetch-restaurants-by-coords'
import { generateTokenMap } from '~/services/generate-token-map'
import { parseAndValidateCoords } from '~/services/parse-and-validate-coords'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

interface ResultPageSearchParams {
  lat: string
  lng: string
  sig: string
  exp: string
  genre?: string
  page?: string
  stationIds?: string
}

interface ResultPageProps {
  searchParams: Promise<ResultPageSearchParams>
}

export const metadata: Metadata = {
  title: '検索結果',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function Result({ searchParams }: ResultPageProps) {
  const params = await searchParams

  if (!params.lat || !params.lng)
    redirect('/?error=missing_params')

  const { lat, lng } = await parseAndValidateCoords(params)

  const midpoint = await verifyCoordsSignature({
    lat,
    lng,
    sig: params.sig,
    exp: params.exp,
  })

  if (!midpoint.success) {
    const errorCode = mapCauseToErrorCode(midpoint.cause)
    redirect(`/?error=${errorCode}`)
  }

  const currentPage = Number(params.page) || 1
  const genreCode = params.genre

  const restaurants = await fetchRestaurantsByCoords({
    lat,
    lng,
    page: currentPage,
    itemsPerPage: 10,
    genre: genreCode,
  })

  if (!restaurants.success) {
    const errorCode = mapCauseToErrorCode(restaurants.cause)
    redirect(`/?error=${errorCode}`)
  }

  const { items, pagination } = restaurants.data

  const tokenMap = await generateTokenMap({
    stationIds: params.stationIds,
    sig: params.sig,
    exp: params.exp,
    lat: params.lat,
    lng: params.lng,
    restaurantIds: items.map(item => item.id),
  })

  return (
    <main className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden md:flex">
      <h1 className="sr-only">中間地点周辺の飲食店検索結果</h1>
      <section
        className="h-mobile-map w-full md:h-desktop-map md:w-3/5 md:flex-1"
        aria-label="検索結果の地図"
      >
        {midpoint.data
          ? <Map midpoint={midpoint.data} restaurants={items} />
          : <MapError />}
      </section>

      <RestaurantList
        restaurants={items}
        pagination={pagination}
        tokenMap={tokenMap}
      />
    </main>
  )
}
