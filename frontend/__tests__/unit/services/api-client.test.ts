import { logger, reportHttpError } from '~/lib/logger'
import { apiFetch } from '~/services/api-client'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
  reportHttpError: vi.fn(),
}))

describe('api-client(unit)', () => {
  describe('apiFetch', () => {
    let fetchSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fetchSpy = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),

      )
      vi.stubGlobal('fetch', fetchSpy)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.clearAllMocks()
    })

    it('withAuth: true かつ cache/next 未指定のとき、cache: "no-cache" を設定する', async () => {
      await apiFetch('/source', { method: 'GET', withAuth: true })
      const init = fetchSpy.mock.calls[0][1] as RequestInit
      expect(init.cache).toBe('no-cache')
    })

    it('cache を明示したとき、既定より明示値を優先する', async () => {
      await apiFetch('/source', { method: 'GET', withAuth: true, cache: 'force-cache' })
      const init = fetchSpy.mock.calls[0][1] as RequestInit
      expect(init.cache).toBe('force-cache')
    })

    it('next を明示したとき、cache の既定設定は行わない', async () => {
      await apiFetch('/source', { method: 'GET', withAuth: true, next: { revalidate: 10 } })
      const init = fetchSpy.mock.calls[0][1] as RequestInit
      expect(init.cache).toBeUndefined()
    })

    it('POST: プレーンオブジェクトで送るとき、Content-Type を付与し snake JSON を文字列で送信する', async () => {
      await apiFetch('/items', { method: 'POST', body: { itemCount: 1 } })
      const init = fetchSpy.mock.calls[0][1] as RequestInit
      const headers = init.headers as Headers
      expect(headers.get('content-type')).toBe('application/json')
      expect(init.body).toBe(JSON.stringify({ item_count: 1 }))
    })

    it('DELETE: body なしのとき、Content-Type を付与しない', async () => {
      await apiFetch('/items/1', { method: 'DELETE' })
      const init = fetchSpy.mock.calls[0][1] as RequestInit
      const headers = init.headers as Headers
      expect(headers.get('content-type')).toBeNull()
      expect(init.body).toBeUndefined()
    })

    it('HTTP ステータスが 2xx 以外のとき、reportHttpError を呼び出して ApiError を投げる', async () => {
      fetchSpy.mockResolvedValue(new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'applicaton/json' },
      }))

      const result = apiFetch('/not-found', { method: 'GET' })

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
  })
})
