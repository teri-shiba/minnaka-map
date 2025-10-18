'use server'

import type { FavoriteStatus } from '~/types/favorite'
import type { GetFavoriteStatusRes } from '~/types/favorite.dto'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'

export async function checkFavoriteStatus(
  hotpepperId: string,
  searchHistoryId: string,
): Promise<FavoriteStatus> {
  try {
    const response = await apiFetch<GetFavoriteStatusRes>('favorites/status', {
      params: { searchHistoryId, hotpepperId },
      withAuth: true,
    })

    if (!isApiSuccess(response)) {
      return {
        isFavorite: false,
        favoriteId: null,
        message: getApiErrorMessage(response),
      }
    }

    return response.data
  }
  catch (error) {
    logger(error, { component: 'checkFavoriteStatus' })
    return {
      isFavorite: false,
      favoriteId: null,
      message: '予期しないエラーが発生しました',
    }
  }
}
