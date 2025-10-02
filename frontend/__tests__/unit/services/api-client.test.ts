import type { Mock } from 'vitest'
import type { ServiceFailure } from '~/types/service-result'
import type { QueryParams } from '~/utils/api-url'
import { logger } from '~/lib/logger'
import { ApiError, apiFetchAuth, apiFetchPublic, handleApiError } from '~/services/api-client'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { apiUrl } from '~/utils/api-url'
import { toCamelDeep, toSnakeDeep } from '~/utils/case-convert'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

vi.mock('~/utils/api-url', () => {
  const apiUrl = vi.fn((_path: string, _params?: Record<string, unknown>) => {
    return new URL('https://api.minnaka-map.com/mock')
  })
  return { apiUrl }
})

vi.mock('~/utils/case-convert', () => {
  const isPlainObject = (value: unknown) =>
    value != null && typeof value === 'object' && !Array.isArray(value)

  return {
    isPlainObject,
    toCamelDeep: vi.fn((input: unknown) => ({ __toCamel__: input })),
    toSnakeDeep: vi.fn((input: unknown) => ({ __toSnake__: input })),
  }
})

function fetchMock(): Mock {
  return vi.mocked(globalThis.fetch as unknown as Mock)
}

function mockFetchOnce(res: {
  ok: boolean
  status: number
  headers?: HeadersInit
  textBody?: string
  jsonBody?: unknown
}) {
  const headers = new Headers(res.headers ?? { 'content-type': 'application/json' })
  const response = {
    ok: res.ok,
    status: res.status,
    headers,
    text: vi.fn().mockResolvedValue(res.textBody ?? ''),
    json: vi.fn().mockResolvedValue(res.jsonBody ?? {}),
  }
  fetchMock().mockResolvedValue(response)
  return response
}

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('apiFetchPublic', () => {
    it('クエリパラメータが与えられたとき、スネークに変換してURL生成関数に渡し、その結果をリクエスト先として使用する', async () => {
      ;(toSnakeDeep as Mock).mockImplementationOnce(() => ({ user_name: 'taro' }))
      mockFetchOnce({ ok: true, status: 200, jsonBody: { ok: true } })

      const params: QueryParams = { userName: 'taro' }
      await apiFetchPublic('/users', { params })
      expect(apiUrl).toHaveBeenCalledWith('/users', { user_name: 'taro' })

      const [urlArg, initArg] = fetchMock().mock.calls[0]
      const returnedUrl: URL = (apiUrl as Mock).mock.results[0].value
      expect(urlArg).toBe(String(returnedUrl))

      const headers = initArg.headers as Headers
      expect(headers.get('Accept')).toBe('application/json')
      expect(headers.get('Content-Type')).toBeNull()
    })

    it('POST を指定したとき、body をスネーク化して、JSON 文字列として送信する', async () => {
      ;(toSnakeDeep as Mock).mockImplementationOnce(() => ({ item_count: 1 }))
      mockFetchOnce({ ok: true, status: 200, jsonBody: { ok: true } })

      await apiFetchPublic('/items', { method: 'POST', body: { itemCount: 1 } })

      const [, requestInit] = fetchMock().mock.calls[0]
      expect(requestInit.method).toBe('POST')

      const headers = requestInit.headers as Headers
      expect(headers.get('Content-Type')).toBe('application/json')
      expect(JSON.parse(requestInit.body as string)).toEqual({ item_count: 1 })
    })

    it('追加ヘッダーを指定したとき、既定ヘッダーを上書きして送信する', async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        headers: { 'content-type': 'application/json' },
        textBody: 'ok',
      })

      await apiFetchPublic('/headers', {
        method: 'POST',
        body: { count: 1 },
        extraHeaders: { 'Accept': 'text/plain', 'X-Request-Id': 'req-1' },
      })

      const [, requestInit] = fetchMock().mock.calls[0]
      const headers = requestInit.headers as Headers
      expect(headers.get('Accept')).toBe('text/plain')
      expect(headers.get('X-Request-Id')).toBe('req-1')
    })

    it('next と cache を指定したとき、リクエストオプションとして含める', async () => {
      mockFetchOnce({ ok: true, status: 200, jsonBody: {} })

      await apiFetchPublic('/options', {
        next: { revalidate: 60 },
        cache: 'no-store',
      })

      const [, requestInit] = fetchMock().mock.calls[0]
      expect(requestInit.next).toEqual({ revalidate: 60 })
      expect(requestInit.cache).toBe('no-store')
    })

    it('content-Type が text/* のとき、text() の結果を返す', async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        textBody: 'hello',
      })

      const result = await apiFetchPublic('/plaintext')
      expect(result).toBe('hello')
      expect(toCamelDeep).not.toHaveBeenCalled()
    })

    it('HTTP ステータスが 204 のとき、null を返す', async () => {
      mockFetchOnce({ ok: true, status: 204, jsonBody: {} })

      const result = await apiFetchPublic('/no-content')
      expect(result).toBeNull()
    })

    it('responseCase が "camel" のとき、JSON をキャメル表記に変換して返す', async () => {
      ;(toCamelDeep as Mock).mockImplementationOnce(() => ({ userName: 'taro' }))
      mockFetchOnce({ ok: true, status: 200, jsonBody: { user_name: 'taro' } })

      const result = await apiFetchPublic('/users', { responseCase: 'camel' })
      expect(result).toEqual({ userName: 'taro' })
      expect(toCamelDeep).toHaveBeenCalled()
    })

    it('responseCase が "none" のとき、変換を行わず JSON をそのまま返す', async () => {
      mockFetchOnce({ ok: true, status: 200, jsonBody: { raw_key: 1 } })
      const result = await apiFetchPublic('/payload', { responseCase: 'none' })
      expect(result).toEqual({ raw_key: 1 })
      expect(toCamelDeep).not.toHaveBeenCalled()
    })

    it('requestCase が "none"のとき、body/params は変換せずに URL 生成関数に渡し、その結果をリクエスト先として使用する', async () => {
      mockFetchOnce({ ok: true, status: 200, jsonBody: {} })

      const params: QueryParams = { searchKey: 'value' }
      await apiFetchPublic('/query', {
        method: 'POST',
        params,
        body: { searchKey: 1 },
        requestCase: 'none',
      })

      expect(toSnakeDeep).not.toHaveBeenCalled()
      expect(apiUrl).toHaveBeenCalledWith('/query', { searchKey: 'value' })

      const [urlArg, requestInit] = fetchMock().mock.calls[0]
      const returnedUrl: URL = (apiUrl as Mock).mock.results[0].value
      expect(urlArg).toBe(String(returnedUrl))
      expect(JSON.parse(requestInit.body as string)).toEqual({ searchKey: 1 })
    })

    it('HTTP 成功(2xx) ではない応答のとき、記録を残して body 付きの ApiError を投げる', async () => {
      const response = mockFetchOnce({
        ok: false,
        status: 404,
        headers: { 'content-type': 'application/json' },
        textBody: 'Not Found',
      })

      await expect(apiFetchPublic('/not-found')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        body: 'Not Found',
      })

      expect(response.text).toHaveBeenCalled()
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('/not-found failed'),
        expect.objectContaining({
          tags: expect.objectContaining({
            component: 'apiFetch',
            path: '/not-found',
            method: 'GET',
            status: 404,
            withAuth: false,
          }),
        }),
      )
    })

    it('ネットワーク層で ApiError 以外の例外が発生したとき、記録を残して例外をそのまま投げ直す', async () => {
      fetchMock().mockRejectedValue(new Error('unexpected failure'))

      await expect(apiFetchPublic('/simulate-error')).rejects.toThrow('unexpected failure')

      expect(logger).toHaveBeenCalledWith(
        expect.any(Error),
        {
          tags: expect.objectContaining({
            component: 'api-client',
            path: '/simulate-error',
            method: 'GET',
          }),
        },
      )
    })
  })

  describe('apiFetchAuth', () => {
    it('認証付きで呼び出したとき、認証ヘッダーを付与して送信する', async () => {
      ;(getAuthFromCookie as Mock).mockResolvedValue({
        accessToken: 'token',
        client: 'client',
        uid: 'uid',
      })
      mockFetchOnce({ ok: true, status: 200, jsonBody: {} })
      await apiFetchAuth('/me', { method: 'GET' })

      const [, requestInit] = fetchMock().mock.calls[0]
      const headers = requestInit.headers as Headers
      expect(headers.get('access-token')).toBe('token')
      expect(headers.get('client')).toBe('client')
      expect(headers.get('uid')).toBe('uid')
    })

    it('HTTP 成功(2xx) ではない応答のとき、記録には withAuth: true を含める', async () => {
      ;(getAuthFromCookie as Mock).mockResolvedValue({
        accessToken: 'token',
        client: 'client',
        uid: 'uid',
      })

      mockFetchOnce({
        ok: false,
        status: 401,
        headers: { 'content-type': 'application/json' },
        textBody: 'Unauthorized',
      })

      await expect(apiFetchAuth('/auth-required')).rejects.toMatchObject({
        name: 'ApiError',
        status: 401,
        body: 'Unauthorized',
      })

      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('/auth-required failed'),
        expect.objectContaining({
          tags: expect.objectContaining({
            component: 'apiFetch',
            path: '/auth-required',
            method: 'GET',
            status: 401,
            withAuth: true,
          }),
        }),
      )
    })

    it('content-Type が text/* のとき、text() の結果を返す（認証付きでも同様に動作する）', async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        headers: { 'content-type': 'text/plain' },
        textBody: 'profile',
      })

      const text = await apiFetchAuth('/profile', { method: 'GET' })
      expect(text).toBe('profile')
    })
  })

  describe('handleApiError', () => {
    const options = { component: 'comp', defaultMessage: '既定文言' }

    const cases: Array<[number, ServiceFailure]> = [
      [401, { success: false, message: '認証が必要です', cause: 'UNAUTHORIZED' }],
      [403, { success: false, message: '権限がありません', cause: 'FORBIDDEN' }],
      [404, { success: false, message: 'リソースが見つかりません', cause: 'NOT_FOUND' }],
      [429, { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }],
      [500, { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }],
      [418, { success: false, message: '既定文言', cause: 'REQUEST_FAILED' }],
    ]

    it.each(cases)(
      'HTTP ステータスが %d のとき、対応する ServiceFailure を返す',
      (statusCode, expected) => {
        const error = new ApiError(statusCode, 'http-error')
        const result = handleApiError(error, options)
        expect(result).toEqual(expected)
      },
    )

    it('HTTP ステータスが 404 のとき、nouFoundMessage を優先して返す', () => {
      const error = new ApiError(404, 'http-error')
      const result = handleApiError(error, { ...options, notFoundMessage: '見つかりませんでした' })
      expect(result).toEqual({ success: false, message: '見つかりませんでした', cause: 'NOT_FOUND' })
    })

    it('typeError が渡されたとき、ネットワークエラーとして返す', () => {
      const result = handleApiError(new TypeError('failed'), options)
      expect(result).toEqual({ success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' })
    })

    it('apiError 以外の例外が渡されたとき、記録したうえで既定メッセージを返す', () => {
      const result = handleApiError(new Error('unexpected failure'), options)
      expect(result).toEqual({ success: false, message: '既定文言', cause: 'REQUEST_FAILED' })
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('non-ApiError'),
        expect.objectContaining({
          tags: expect.objectContaining({
            component: 'comp',
          }),
        }),
      )
    })
  })
})
