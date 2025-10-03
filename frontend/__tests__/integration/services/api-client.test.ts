import { http, HttpResponse } from 'msw'
import { logger } from '~/lib/logger'
import { apiFetchAuth, apiFetchPublic } from '~/services/api-client'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn().mockResolvedValue({
    accessToken: 'token-123',
    client: 'client-123',
    uid: 'uid-123',
  }),
}))

describe('api-client（MSW 結合)', () => {
  describe('apiFetchPublic', () => {
    it('クエリパラメータが与えられたとき、スネークに変換して送信する', async () => {
      server.use(
        http.get('*/users', ({ request }) => {
          const url = new URL(request.url)
          const userName = url.searchParams.get('user_name')
          return HttpResponse.json({ query: { user_name: userName } })
        }),
      )
      const result = await apiFetchPublic('/users', {
        params: { userName: 'taro' },
        responseCase: 'none',
      })
      expect(result).toEqual({ query: { user_name: 'taro' } })
    })

    it('POST のとき、body をスネーク化し JSON 文字列として送信する', async () => {
      server.use(
        http.post('*/items', async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({ body })
        }),
      )

      const result = await apiFetchPublic('/items', {
        method: 'POST',
        body: { itemCount: 1 },
        responseCase: 'none',
      })
      expect(result).toEqual({ body: { item_count: 1 } })
    })

    it('追加ヘッダーを上書き送信し、text/* は text() の結果を返す', async () => {
      server.use(
        http.post('*/headers', async ({ request }) => {
          return HttpResponse.json({
            headers: {
              'accept': request.headers.get('accept'),
              'x-request-id': request.headers.get('x-request-id'),
            },
          })
        }),
      )

      const result = await apiFetchPublic('/headers', {
        method: 'POST',
        body: { count: 1 },
        extraHeaders: { 'Accept': 'text/plain', 'X-Request-Id': 'req-1' },
        responseCase: 'none',
      })
      expect(result).toEqual({
        headers: {
          'accept': 'text/plain',
          'x-request-id': 'req-1',
        },
      })
    })

    it('content-type が text/* のとき、text() の結果を返す', async () => {
      server.use(
        http.get('*/plaintext', () => HttpResponse.text('hello')),
      )

      const result = await apiFetchPublic('/plaintext')
      expect(result).toBe('hello')
    })

    it('HTTP ステータスが 204 のとき、null を返す', async () => {
      server.use(
        http.get('*/no-content', () => new HttpResponse(null, { status: 204 })),
      )

      const result = await apiFetchPublic('/no-content')
      expect(result).toBeNull()
    })

    it('responseCase を "camel" にしたとき、 snake JSON を camel にして返す', async () => {
      server.use (
        http.get('*/users', () => HttpResponse.json({ user_name: 'taro' })),
      )

      const result = await apiFetchPublic('/users', { responseCase: 'camel' })
      expect(result).toEqual({ userName: 'taro' })
    })

    it('responseCase を "none" にしたとき、 snake JSON を変換せずに返す', async () => {
      server.use (
        http.get('*/users', () => HttpResponse.json({ user_name: 'taro' })),
      )

      const result = await apiFetchPublic('/users', { responseCase: 'none' })
      expect(result).toEqual({ user_name: 'taro' })
    })

    it('requestCase を "none" にしたとき、params/body を変換せずに返す ', async () => {
      server.use(
        http.post('*/query', async ({ request }) => {
          const url = new URL(request.url)
          const body = await request.json()
          const searchKey = url.searchParams.get('searchKey')
          return HttpResponse.json({ query: { searchKey }, body })
        }),
      )

      const result = await apiFetchPublic('*/query', {
        method: 'POST',
        params: { searchKey: 'value' },
        body: { searchKey: 1 },
        requestCase: 'none',
        responseCase: 'none',
      })
      expect(result).toEqual({
        query: { searchKey: 'value' },
        body: { searchKey: 1 },
      })
    })

    it('HTTP ステータスが 2xx 以外のとき、ApiError を投げ、ログを記録する', async () => {
      server.use(
        http.get('*/not-found', () => {
          return HttpResponse.text('Not Found', {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }),
      )

      const result = apiFetchPublic('/not-found')
      await expect(result).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        body: 'Not Found',
      })

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

    it('ネットワーク層で ApiError 以外の例外が起きたとき、ログを記録してそのまま投げ直す', async () => {
      server.use(
        http.get('*/simulator-error', () => HttpResponse.error()),
      )

      const result = apiFetchPublic('/simulator-error')
      await expect(result).rejects.toBeInstanceOf(Error)

      expect(logger).toHaveBeenCalledWith(
        expect.any(Error),
        {
          tags: expect.objectContaining({
            component: 'api-client',
            path: '/simulator-error',
            method: 'GET',
            withAuth: false,
          }),
        },
      )
    })
  })

  describe('apiFetchAuth', () => {
    it('認証付きで呼び出したとき、認証ヘッダーの値を返す', async () => {
      server.use(
        http.get('*/auth', ({ request }) => {
          return HttpResponse.json({
            headers: {
              'access-token': request.headers.get('access-token'),
              'client': request.headers.get('client'),
              'uid': request.headers.get('uid'),
            },
          })
        }),
      )

      const result = await apiFetchAuth('/auth', {
        method: 'GET',
        responseCase: 'none',
      })
      expect(result).toEqual({
        headers: {
          'access-token': 'token-123',
          'client': 'client-123',
          'uid': 'uid-123',
        },
      })
    })

    it('content-type が text/* のとき、text() の結果を返す', async () => {
      server.use(
        http.get('*/plaintext', () => HttpResponse.text('hello')),
      )

      const result = await apiFetchAuth('/plaintext')
      expect(result).toBe('hello')
    })

    it('HTTP ステータスが 2xx 以外のとき、logger のタグに withAuth: true を含める', async () => {
      server.use(
        http.get('*/auth-required', () => {
          return HttpResponse.text('Unauthorized', {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }),
      )

      const result = apiFetchAuth('/auth-required')
      await expect(result).rejects.toBeInstanceOf(Error)

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
  })
})
