'use server'

import type { FavoriteActionResponse } from '~/types/favorite'
import type { DeleteFavoriteRes } from '~/types/favorite.dto'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch, handleApiError } from './api-client'

export async function removeFromFavorites(
  favoriteId: number,
): Promise<FavoriteActionResponse> {
  try {
    const response = await apiFetch<DeleteFavoriteRes>(
      `favorites/${favoriteId}`,
      { method: 'DELETE', withAuth: true },
    )

    if (!isApiSuccess(response))
      return { success: false, message: getApiErrorMessage(response) }

    return { success: true }
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'removeFromFavorites',
      defaultMessage: 'お気に入りの削除に失敗しました',
    })
    return { success: false, message: failure.message }
  }
}
