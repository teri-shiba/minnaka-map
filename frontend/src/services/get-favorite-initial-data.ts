'use server'

import type { getAuthFromCookie } from './get-auth-from-cookie'
import { checkFavoriteStatus } from './check-favorite-status'
import { decodeToken } from './decode-token'

interface FavoriteInitialData {
  auth: Awaited<ReturnType<typeof getAuthFromCookie>>
  hotpepperId: string
  historyId?: string
  token?: string
}

export async function getFavoriteInitialData({
  auth,
  hotpepperId,
  historyId,
  token,
}: FavoriteInitialData) {
  if (!auth)
    return { resolvedHistoryId: historyId, favoriteData: null }

  const decodeHistoryId = token
    ? await decodeToken(token).then(result =>
        result.success ? result.data.searchHistoryId : undefined,
      )
    : undefined

  const resolvedHistoryId = historyId || decodeHistoryId

  if (!resolvedHistoryId)
    return { resolvedHistoryId, favoriteData: null }

  const favoriteResult = await checkFavoriteStatus(hotpepperId, resolvedHistoryId)

  return {
    resolvedHistoryId,
    favoriteData: favoriteResult.success ? favoriteResult.data : null,
  }
}
