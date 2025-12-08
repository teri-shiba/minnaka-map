import type { ServiceCause } from '~/types/service-result'
import axios, { isAxiosError } from 'axios'

const baseURL = new URL('/api/v1', process.env.NEXT_PUBLIC_API_BASE_URL).href

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 5000,
})

function getServiceCauseFromStatus(status: number): ServiceCause {
  switch (status) {
    case 0: return 'NETWORK'
    case 401: return 'INVALID_CREDENTIALS'
    case 403: return 'FORBIDDEN'
    case 404: return 'NOT_FOUND'
    case 429: return 'RATE_LIMIT'
    default:
      if (status >= 500)
        return 'SERVER_ERROR'

      return 'REQUEST_FAILED'
  }
}

function checkEmailConflict(data: unknown): boolean {
  if (!data || typeof data !== 'object')
    return false

  return (data as Record<string, unknown>).error === 'duplicate_email'
}

function checkAlreadyConfirmed(data: unknown): boolean {
  if (!data || typeof data !== 'object')
    return false
  return (data as Record<string, unknown>).error === 'already_confirmed'
}

function checkInvalidToken(data: unknown): boolean {
  if (!data || typeof data !== 'object')
    return false
  return (data as Record<string, unknown>).error === 'invalid_token'
}

api.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      let cause: ServiceCause = 'NETWORK'

      if (error.response) {
        const { status, data } = error.response

        if (status === 422 && checkEmailConflict(data)) {
          cause = 'DUPLICATE_EMAIL'
        }
        else if (status === 400 && checkAlreadyConfirmed(data)) {
          cause = 'ALREADY_CONFIRMED'
        }
        else if (status === 404 && checkInvalidToken(data)) {
          cause = 'INVALID_TOKEN'
        }
        else {
          cause = getServiceCauseFromStatus(status)
        }
      }

      Object.defineProperty(error, 'cause', {
        value: cause,
        writable: true,
        configurable: true,
      })
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
