import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
import MapClient from '~/components/features/map/map-client'
import RestaurantList from '~/components/features/restaurant/restaurant-list'
import { fetchRestaurants } from '~/services/fetch-restaurants'
import { getApiKey } from '~/services/get-api-key'
import { parseAndValidateCoordinates } from '~/services/parse-and-validate-coords'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'
import { isServiceSuccess } from '~/types/service-result'

interface ResultPageProps {
  searchParams: Promise<SearchParams & { page?: string }>
}

export default async function Result({ searchParams }: ResultPageProps) {
  const params = await searchParams

  if (!params.lat || !params.lng || !params.signature)
    redirect('/?error=missing_params')

  const { lat, lng } = await parseAndValidateCoordinates(params)

  const verifyResult = await verifyCoordsSignature({
    latitude: lat,
    longitude: lng,
    signature: params.signature,
    expires_at: params.expires_at,
  })

  if (!isServiceSuccess(verifyResult)) {
    const key
      = verifyResult.cause === 'EXPIRED'
        ? 'link_expired'
        : verifyResult.cause === 'INVALID_SIGNATURE'
          ? 'validation_failed'
          : verifyResult.cause === 'NETWORK'
            ? 'network_error'
            : verifyResult.cause === 'SERVER_ERROR' ? 'validation_error' : 'validation_error'

    redirect(`/?error=${key}`)
  }

  const midpoint = verifyResult.data

  const currentPage = Number(params.page) || 1
  const genreCode = params.genre

  const restaurantsResult = await fetchRestaurants({
    latitude: lat,
    longitude: lng,
    page: currentPage,
    itemsPerPage: 10,
    genre: genreCode,
  })

  if (!restaurantsResult.success) {
    const key
    = restaurantsResult.cause === 'RATE_LIMIT'
      ? 'rate_limit_exceeded'
      : restaurantsResult.cause === 'SERVER_ERROR'
        ? 'server_error'
        : 'restaurant_fetch_failed'

    redirect(`/?error=${key}`)
  }

  const { items, pagination } = restaurantsResult.data

  let maptilerApiKey: string | null = null
  try {
    maptilerApiKey = await getApiKey('maptiler')
  }
  catch {
    maptilerApiKey = null
  }

  return (
    <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden md:flex">
      <div className="h-mobile-map w-full md:h-desktop-map md:w-3/5 md:flex-1">
        {(maptilerApiKey && midpoint)
          && (
            <MapClient
              apiKey={maptilerApiKey}
              midpoint={midpoint}
              restaurants={items}
            />
          )}
      </div>

      <RestaurantList
        restaurants={items}
        pagination={pagination}
      />
    </div>
  )
}
