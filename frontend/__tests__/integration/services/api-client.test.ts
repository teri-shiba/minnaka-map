import { http, HttpResponse } from 'msw'
import { logger, reportHttpError } from '~/lib/logger'
import { apiFetch } from '~/services/api-client'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
  reportHttpError: vi.fn(),
}))

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn().mockResolvedValue({
    accessToken: 'token-123',
    client: 'client-123',
    uid: 'uid-123',
  }),
}))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

describe('api-client（integration / MSW)', () => {
  describe('apiFetch', () => {
    it('GET: クエリは snake で送信され、レスポンスは camel で返る', async () => {
      server.use(
        http.get('*/users', ({ request }) => {
          const url = new URL(request.url)
          const userName = url.searchParams.get('user_name')
          return HttpResponse.json({ query: { user_name: userName } })
        }),
      )
      const result = await apiFetch('/users', { params: { userName: 'taro' } })
      expect(result).toEqual({ query: { userName: 'taro' } })
    })

    it('POST: body は snake で送信され、レスポンスは camel で返る', async () => {
      server.use(
        http.post('*/items', async ({ request }) => {
          const body = await request.json().catch(() => undefined) as unknown
          const isSnake = isRecord(body) && 'item_count' in body && !('itemCount' in body)
          return HttpResponse.json({ isSnake, body })
        }),
      )

      const result = await apiFetch('/items', { method: 'POST', body: { itemCount: 1 } })
      expect(result).toEqual({ isSnake: true, body: { itemCount: 1 } })
    })

    it('追加ヘッダーを上書きして送信できる（サーバー側で値を検証）', async () => {
      server.use(
        http.post('*/override', async ({ request }) => {
          const accept = request.headers.get('accept')
          const xRequestId = request.headers.get('x-request-id')
          const ok = accept === 'text/plain' && xRequestId === 'req-1'
          return HttpResponse.json({ ok })
        }),
      )

      const result = await apiFetch('/override', {
        method: 'POST',
        body: { count: 1 },
        extraHeaders: { 'Accept': 'text/plain', 'X-Request-Id': 'req-1' },
      })
      expect(result).toEqual({ ok: true })
    })

    it('content-type が text/* のとき、text() の結果を返す', async () => {
      server.use(
        http.get('*/plaintext', () => HttpResponse.text('hello')),
      )

      const result = await apiFetch('/plaintext')
      expect(result).toBe('hello')
    })

    it('HTTP ステータスが 204 のとき、null を返す', async () => {
      server.use(
        http.get('*/no-content', () => new HttpResponse(null, { status: 204 })),
      )

      const result = await apiFetch('/no-content')
      expect(result).toBeNull()
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

      const result = apiFetch('/not-found')
      await expect(result).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        body: 'Not Found',
      })

      expect(reportHttpError).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          method: 'GET',
          path: '/not-found',
          component: 'apiFetch',
          withAuth: false,
          responseBody: 'Not Found',
        }),
      )

      expect(logger).not.toHaveBeenCalled()
    })

    it('ネットワーク層で ApiError 以外の例外が起きたとき、ログを記録してそのまま投げ直す', async () => {
      server.use(
        http.get('*/simulator-error', () => HttpResponse.error()),
      )

      const result = apiFetch('/simulator-error')
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

  describe('withAuth: true', () => {
    it('認証ヘッダーを送信でき、サーバで受信した値を検証する', async () => {
      server.use(
        http.get('*/auth', ({ request }) => {
          const ok
            = request.headers.get('access-token') === 'token-123'
              && request.headers.get('client') === 'client-123'
              && request.headers.get('uid') === 'uid-123'
          return HttpResponse.json({ ok })
        }),
      )

      const result = await apiFetch('/auth', { withAuth: true })
      expect(result).toEqual({ ok: true })
    })

    it('content-type が text/* のとき、text() の結果を返す', async () => {
      server.use(
        http.get('*/plaintext', () => HttpResponse.text('hello')),
      )

      const result = await apiFetch('/plaintext', { withAuth: true })
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

      const result = apiFetch('/auth-required', { withAuth: true })
      await expect(result).rejects.toBeInstanceOf(Error)

      expect(reportHttpError).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          method: 'GET',
          path: '/auth-required',
          component: 'apiFetch',
          withAuth: true,
          responseBody: 'Unauthorized',
        }),
      )
    })

    it('DELETE で body なしのとき、Content-Type を付与しない（サーバーで null を観測）', async () => {
      server.use(
        http.delete('*/items/:id', ({ request }) => {
          return HttpResponse.json({
            contentType: request.headers.get('content-type'),
          })
        }),
      )

      const result = await apiFetch('/items/1', { method: 'DELETE', withAuth: true })
      expect(result).toEqual({ contentType: null })
    })
  })
})
