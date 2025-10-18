'use server'

import type { FavoriteActionResponse } from '~/types/favorite'
import type { CreateFavoriteRes } from '~/types/favorite.dto'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch, handleApiError } from './api-client'

export async function addToFavorites(
  hotpepperId: string,
  searchHistoryId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetch<CreateFavoriteRes>(
      'favorites',
      {
        method: 'POST',
        body: {
          favorite: { searchHistoryId, hotpepperId },
        },
        withAuth: true,
      },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true, favoriteId: response.data.id }
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'addToFavorites',
      defaultMessage: 'お気に入りの追加に失敗しました',
    })
    return { success: false, message: failure.message }
  }
}
