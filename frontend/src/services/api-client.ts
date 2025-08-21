'use server'

import type { ServiceFailure } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { getAuthFromCookie } from './get-auth-from-cookie'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ErrorHandlingOptions {
  component: string
  defaultMessage: string
  notFoundMessage?: string
  extraContext?: Record<string, any>
}

interface ApiFetchOptions {
  readonly withAuth?: boolean
  readonly extraHeaders?: HeadersInit
}

export class ApiError extends Error {
  readonly status: number
  readonly body?: string
  constructor(status: number, message: string, body?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function getAuthHeader(
  method: string,
  withAuth: boolean,
  extraHeaders?: HeadersInit,
): Promise<HeadersInit> {
  const base: HeadersInit = {}

  if (method !== 'GET')
    base['Content-Type'] = 'application/json'

  if (extraHeaders)
    Object.assign(base, extraHeaders)

  if (!withAuth)
    return base

  const auth = await getAuthFromCookie()
  if (!auth)
    return base

  return {
    ...base,
    'access-token': auth.accessToken,
    'client': auth.client,
    'uid': auth.uid,
  }
}

export async function apiFetch<T = any>(
  path: string,
  method: HttpMethod = 'GET',
  body?: any,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { withAuth = true, extraHeaders } = options
  const url = `${process.env.API_BASE_URL}/${path}`
  const headers = await getAuthHeader(method, withAuth, extraHeaders)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      const error = new ApiError(response.status, `${method} ${url} failed`, text)

      logger(error, {
        tags: { component: 'apiFetch', path, method, status: response.status, withAuth },
      })

      throw error
    }

    return await response.json() as T
  }
  catch (error) {
    if (!(error instanceof ApiError)) {
      logger(error, { tags: { component: 'api-client', path, method, withAuth } })
    }
    throw error
  }
}

export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions,
): ServiceFailure {
  const { component, defaultMessage, notFoundMessage, extraContext } = options

  if (!(error instanceof ApiError)) {
    logger(error, { tags: { component, ...extraContext } })
  }

  if (error instanceof ApiError) {
    if (error.status === 404)
      return { success: false, message: notFoundMessage ?? 'リソースが見つかりません', cause: 'NOT_FOUND' }
    if (error.status === 429)
      return { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }
    if (error.status >= 500)
      return { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

    return { success: false, message: defaultMessage, cause: 'REQUEST_FAILED' }
  }

  if (error instanceof TypeError)
    return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

  return { success: false, message: defaultMessage, cause: 'REQUEST_FAILED' }
}
