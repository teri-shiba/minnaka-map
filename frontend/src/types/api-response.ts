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
