import type { SearchParams } from '~/types/search-params'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Map from '~/components/features/map/map'
import RestaurantList from '~/components/features/restaurant/restaurant-list'
import { Button } from '~/components/ui/button'
import { fetchRestaurantsByCoords } from '~/services/fetch-restaurants-by-coords'
import { getApiKey } from '~/services/get-api-key'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { issueFavoriteTokens } from '~/services/issue-favorite-tokens'
import { parseAndValidateCoords } from '~/services/parse-and-validate-coords'
import { saveSearchHistory } from '~/services/save-search-history'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

export interface TokenInfo {
  token: string
  restaurantId: string
  searchHistoryId: number
}

export type TokenMap = Record<string, TokenInfo>

interface ResultPageProps {
  searchParams: Promise<SearchParams & { page?: string, stationIds: string }>
}

// TODO: 別ファイルに切り出す
async function generateTokenMap(options: {
  hasAuth: boolean
  stationIds?: string
  sig?: string
  exp?: string
  lat: string
  lng: string
  restaurantIds: string[]
}): Promise<TokenMap> {
  if (!options.hasAuth)
    return {}

  if (!options.stationIds || !options.sig || !options.exp)
    return {}

  const stationIds = options.stationIds.split('-').map(Number)

  const historyResult = await saveSearchHistory(stationIds)

  if (!historyResult.success)
    return {}

  const tokensResult = await issueFavoriteTokens({
    searchHistoryId: historyResult.data.searchHistoryId,
    restaurantIds: options.restaurantIds,
    lat: options.lat,
    lng: options.lng,
    sig: options.sig,
    exp: options.exp,
  })

  if (!tokensResult.success)
    return {}

  return tokensResult.data.tokens.reduce((acc, token) => {
    acc[token.restaurantId] = {
      token: token.favoriteToken,
      restaurantId: token.restaurantId,
      searchHistoryId: historyResult.data.searchHistoryId,
    }
    return acc
  }, {} as TokenMap)
}

export default async function Result({ searchParams }: ResultPageProps) {
  const params = await searchParams

  if (!params.lat || !params.lng)
    redirect('/?error=missing_params')

  const { lat, lng } = await parseAndValidateCoords(params)

  const verifyResult = await verifyCoordsSignature({
    lat,
    lng,
    sig: params.sig,
    exp: params.exp,
  })

  if (!verifyResult.success) {
    const errorCode = mapCauseToErrorCode(verifyResult.cause)
    redirect(`/?error=${errorCode}`)
  }

  const midpoint = verifyResult.data

  const currentPage = Number(params.page) || 1
  const genreCode = params.genre

  const restaurantsResult = await fetchRestaurantsByCoords({
    lat,
    lng,
    page: currentPage,
    itemsPerPage: 10,
    genre: genreCode,
  })

  if (!restaurantsResult.success) {
    const errorCode = mapCauseToErrorCode(restaurantsResult.cause)
    redirect(`/?error=${errorCode}`)
  }

  const { items, pagination } = restaurantsResult.data

  const auth = await getAuthFromCookie()

  const tokenMap = await generateTokenMap({
    hasAuth: !!auth,
    stationIds: params.stationIds,
    sig: params.sig,
    exp: params.exp,
    lat: params.lat,
    lng: params.lng,
    restaurantIds: items.map(item => item.id),
  })

  const result = await getApiKey('maptiler')
  if (!result.success)
    return null

  const maptilerApiKey = result.data

  return (
    <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden md:flex">
      <div className="h-mobile-map w-full md:h-desktop-map md:w-3/5 md:flex-1">
        {(maptilerApiKey && midpoint)
          ? (
              <Map
                apiKey={maptilerApiKey}
                midpoint={midpoint}
                restaurants={items}
              />
            )
          : (
              <div className="size-full place-content-center bg-gray-100">
                <div className="flex flex-col items-center gap-1">
                  <p>地図の取得に失敗しました。</p>
                  <p className="pb-4">お手数ですが、トップページから再度お試しください。</p>
                  <Button>
                    <Link href="/">トップに戻る</Link>
                  </Button>
                </div>
              </div>
            )}
      </div>

      <RestaurantList
        restaurants={items}
        pagination={pagination}
        tokenMap={tokenMap}
      />
    </div>
  )
}
