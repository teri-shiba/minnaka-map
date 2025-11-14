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
    case 401: return 'UNAUTHORIZED'
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

api.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const emailConflict = error.response?.status === 422
        && checkEmailConflict(error.response.data)

      const cause: ServiceCause = error.response
        ? (emailConflict ? 'DUPLICATE_EMAIL' : getServiceCauseFromStatus(error.response.status))
        : 'NETWORK'

      Object.assign(error, { cause })
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
