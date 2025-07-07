import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
import MapClient from '~/components/ui/map/MapClient'
import RestaurantList from '~/components/ui/RestaurantList'
import { fetchRestaurants } from '~/services/fetch-restaurants'
import { getApiKey } from '~/services/get-api-key'
import { parseAndValidateCoordinates } from '~/services/parse-and-validate-coords'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'

interface ResultPageProps {
  searchParams: Promise<SearchParams & { page?: string }>
}

export default async function Result({ searchParams }: ResultPageProps) {
  const maptilerApiKey = await getApiKey('maptiler')
  const params = await searchParams

  if (!params.lat || !params.lng || !params.signature) {
    redirect('/?error=missing_params')
  }

  const { lat, lng } = await parseAndValidateCoordinates(params)

  const midpoint = await verifyCoordsSignature({
    latitude: lat,
    longitude: lng,
    signature: params.signature,
    expires_at: params.expires_at,
  })

  const currentPage = Number(params.page) || 1
  const paginatedResult = await fetchRestaurants({
    latitude: lat,
    longitude: lng,
    radius: params.radius,
    page: currentPage,
    itemsPerPage: 10,
  })

  return (
    <>
      <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden sm:flex">
        <div className="h-[calc(60vh-4rem)] w-full md:h-[calc(100vh-4rem)] md:w-3/5">
          {(maptilerApiKey && midpoint)
            && (
              <MapClient
                apiKey={maptilerApiKey}
                midpoint={midpoint}
                restaurants={paginatedResult.items}
              />
            )}
        </div>

        <RestaurantList
          restaurants={paginatedResult.items}
          pagination={paginatedResult.pagination}
        />
      </div>
    </>
  )
}
