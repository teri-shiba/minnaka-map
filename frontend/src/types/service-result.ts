export type ServiceCause =
  | 'NETWORK'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'REQUEST_FAILED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'

export interface ServiceSuccess<T> {
  readonly success: true
  readonly data: T
}

export interface ServiceFailure {
  readonly success: false
  readonly message: string
  readonly cause?: ServiceCause
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

export function isServiceSuccess<T>(result: ServiceResult<T>): result is ServiceSuccess<T> {
  return result.success === true
}

export function getServiceErrorMessage(result: ServiceFailure): string {
  return result.message
}
