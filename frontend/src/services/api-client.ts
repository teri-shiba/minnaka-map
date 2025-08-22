'use server'

import type { ServiceFailure } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { apiUrl } from '~/utils/api-url'
import { getAuthFromCookie } from './get-auth-from-cookie'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ErrorHandlingOptions {
  component: string
  defaultMessage: string
  notFoundMessage?: string
  extraContext?: Record<string, any>
}

interface ApiRequestOptions {
  readonly method?: HttpMethod
  readonly body?: unknown
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

async function addAuthHeaders(headers: Headers): Promise<void> {
  const auth = await getAuthFromCookie()
  if (!auth)
    return

  headers.set('access-token', auth.accessToken)
  headers.set('client', auth.client)
  headers.set('uid', auth.uid)
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    withAuth = false,
    extraHeaders,
  } = options

  const url = apiUrl(path).toString()

  const headers = new Headers({ Accept: 'application/json' })
  if (method !== 'GET')
    headers.set('Content-Type', 'application/json')
  if (extraHeaders)
    new Headers(extraHeaders).forEach((value, headerName) => headers.set(headerName, value))
  if (withAuth)
    await addAuthHeaders(headers)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => undefined)
      const error = new ApiError(response.status, `${method} ${url} failed`, text)

      logger(`${method} ${path} failed`, {
        tags: { component: 'apiFetch', path, method, status: response.status, withAuth },
      })

      throw error
    }

    const contentType = response.headers.get('content-type') ?? ''
    const isText = contentType.includes('text/')
    const isNoContent = response.status === 204

    if (isText) {
      const text = await response.text()
      return text as unknown as T
    }

    if (isNoContent)
      return null as T

    return (await response.json()) as T
  }
  catch (error) {
    if (!(error instanceof ApiError)) {
      logger(error, { tags: { component: 'api-client', path, method, withAuth } })
    }
    throw error
  }
}

// 認証付き
export function apiFetchAuth<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, 'withAuth'> = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, withAuth: true })
}

// 認証なし
export function apiFetchPublic<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, 'withAuth'> = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, withAuth: false })
}

export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions,
): ServiceFailure {
  const { component, defaultMessage, notFoundMessage, extraContext } = options

  if (!(error instanceof ApiError)) {
    logger('handleApiError: non-ApiError', { tags: { component, ...extraContext } })
  }

  if (error instanceof ApiError) {
    if (error.status === 401)
      return { success: false, message: '認証が必要です', cause: 'UNAUTHORIZED' }
    if (error.status === 403)
      return { success: false, message: '権限がありません', cause: 'FORBIDDEN' }
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
