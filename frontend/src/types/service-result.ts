export type ServiceCause
  = | 'NETWORK'
    | 'SERVER_ERROR'
    | 'REQUEST_FAILED'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_SIGNATURE'
    | 'EXPIRED'
    | 'RATE_LIMIT'
    | 'DUPLICATE_EMAIL'
    | 'ALREADY_CONFIRMED'
    | 'INVALID_TOKEN'
    | 'INVALID_CREDENTIALS'

export interface ServiceSuccess<T> {
  readonly success: true
  readonly data: T
}

export interface ServiceFailure {
  readonly success: false
  readonly message: string
  readonly cause: ServiceCause
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure
