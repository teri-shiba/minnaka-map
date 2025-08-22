// export interface ApiResponse<T> {
//   success: boolean
//   data: T
//   message?: string
// }

// TODO: 型の変更による影響ファイルの修正が必要 < create-shared-list.ts / favorite-action.ts / fetch-shared-list.ts / save-search-history.ts >
export interface ApiError {
  readonly message: string
  readonly details?: string
}

export interface ApiSuccess<T> {
  readonly success: true
  readonly data: T
}

export interface ApiFailure {
  readonly success: false
  readonly error: ApiError
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true
}

export function getApiErrorMessage(response: ApiFailure): string {
  return response.error.message
}
