'use server'

import type { TokenMap } from '~/types/token'
import { getAuthFromCookie } from './get-auth-from-cookie'
import { issueFavoriteTokens } from './issue-favorite-tokens'
import { saveSearchHistory } from './save-search-history'

interface GenerateTokenMapOptions {
  stationIds?: string
  lat: string
  lng: string
  sig: string
  exp: string
  restaurantIds: string[]
}

export async function generateTokenMap(options: GenerateTokenMapOptions): Promise<TokenMap> {
  const auth = await getAuthFromCookie()

  if (!auth)
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
