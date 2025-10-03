import type { QueryParams } from '~/utils/api-url'
import { logger, reportHttpError } from '~/lib/logger'
import { apiUrl } from '~/utils/api-url'
import { addAuthHeaders } from '~/utils/auth-headers'
import { isPlainObject } from '~/utils/case-convert'
import { mapToServiceFailure } from '~/utils/map-to-service-failure'
import { parseApiResponse, toSnakeRequest } from '~/utils/serde'
import { fetchWithTimeout } from '~/utils/transport'
import 'server-only'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ErrorHandlingOptions {
  component: string
  defaultMessage: string
  notFoundMessage?: string
  extraContext?: Record<string, unknown>
}

interface ApiRequestOptions {
  readonly method?: HttpMethod
  readonly params?: QueryParams
  readonly body?: unknown
  readonly withAuth?: boolean
  readonly extraHeaders?: HeadersInit
  readonly next?: NextFetchRequestConfig
  readonly cache?: RequestCache
  readonly requestCase?: 'snake' | 'none'
  readonly responseCase?: 'camel' | 'none'
  readonly signal?: AbortSignal
  readonly timeoutMs?: number
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

async function buildHeaders(
  method: HttpMethod,
  extraHeaders: HeadersInit | undefined,
  withAuth: boolean | undefined,
  isJsonBody: boolean,
): Promise<Headers> {
  const headers = new Headers({ Accept: 'application/json' })

  if (method !== 'GET' && isJsonBody)
    headers.set('Content-Type', 'application/json')

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, headerName) => {
      headers.set(headerName, value)
    })
  }

  if (withAuth)
    await addAuthHeaders(headers)

  return headers
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    params: rawParams,
    body: rawBody,
    withAuth = false,
    extraHeaders,
    next,
    cache,
    requestCase = 'snake',
    responseCase = 'camel',
    signal,
    timeoutMs,
  } = options

  const params = toSnakeRequest(rawParams, requestCase === 'snake')
  const body = toSnakeRequest(rawBody, requestCase === 'snake')

  const urlObj = apiUrl(path, params as QueryParams)
  const url = urlObj.toString()
  const willSendJsonBody = method !== 'GET' && body != null && isPlainObject(body)
  const headers = await buildHeaders(method, extraHeaders, withAuth, willSendJsonBody)

  const bodyInit = body != null
    ? (isPlainObject(body) ? JSON.stringify(body) : (body as BodyInit))
    : undefined

  const init: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers,
    body: bodyInit,
  }

  if (cache !== undefined)
    init.cache = cache

  if (next)
    init.next = next

  try {
    const response = await fetchWithTimeout(url, init, { signal, timeoutMs })

    if (!response.ok) {
      const text = await response.text().catch(() => undefined)
      const error = new ApiError(response.status, `${method} ${url} failed`, text)

      reportHttpError({
        error,
        status: response.status,
        method,
        path,
        component: 'apiFetch',
        withAuth,
        responseBody: text,
      })

      throw error
    }

    return parseApiResponse<T>(response, responseCase === 'camel')
  }
  catch (error) {
    if (!(error instanceof ApiError)) {
      logger(error, {
        tags: {
          component: 'api-client',
          path,
          method,
          withAuth,
        },
      })
    }
    throw error
  }
}

// 認証付き
export function apiFetchAuth<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, 'withAuth'> = {},
): Promise<T> {
  const merged: ApiRequestOptions
    = (options.cache === undefined && !options.next)
      ? { ...options, withAuth: true, cache: 'no-store' }
      : { ...options, withAuth: true }

  return apiFetch<T>(path, merged)
}

export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions,
) {
  if ((error as any)?.status == null) {
    logger('handleApiError: non-ApiError', {
      tags: {
        component: options.component,
        ...options.extraContext,
      },
    })
  }

  return mapToServiceFailure(error, options)
}
