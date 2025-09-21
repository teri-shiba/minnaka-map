import type { ApiResponse } from './api-response'
import type { FavoriteGroup, FavoritesPaginationMeta, FavoriteStatus } from './favorite'

// 共通の envelope 短縮
export type Res<T> = ApiResponse<T>

// --- GET /favorites
export type GetFavoritesRes = Res<FavoriteGroup[]>

// --- GET /favorites?page=&limit=
export type GetFavoritesPageRes = Res<FavoriteGroup[]> & { meta: FavoritesPaginationMeta }

// --- GET /favorites/status
export type GetFavoriteStatusRes = Res<FavoriteStatus>

// --- POST /favorites
export type CreateFavoriteRes = Res<{ id: number }>

// --- DELETE /favorites/:id
export type DeleteFavoriteRes = Res<{ id: number, hotpepperId: string }>
