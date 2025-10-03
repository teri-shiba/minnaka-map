import * as Sentry from '@sentry/nextjs'
import { logger, reportHttpError, shouldLogStatus } from '~/lib/logger'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV
  let spyError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('NODE_ENV', originalEnv === 'production' ? 'production' : 'test')
    spyError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllEnvs()
  })

  describe('logger（基本動作）', () => {
    it('本番では、Sentry.captureException を呼ぶ', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = new Error('error')
      const context = { key: 'value' }
      logger(error, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, { extra: context })
      expect(spyError).not.toHaveBeenCalled()
    })

    it('非本番では、console.error に出力する', () => {
      vi.stubEnv('NODE_ENV', 'test')
      const error = new Error('error')
      const context = { key: 'value' }
      logger(error, context)

      expect(spyError).toHaveBeenCalledWith(error, { extra: context })
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    it('context が未指定でもエラーなく動作する', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = new Error('no-context')
      logger(error)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, undefined)
    })

    it('tags を渡すと Sentry のタグとして記録される', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = new Error('error')
      logger(error, { tags: { component: 'componentName' } })

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        { tags: { component: 'componentName' } },
      )
    })
  })

  describe('shouldLogStatus（ログ抑制の判定）', () => {
    it('HTTP ステータスが 401/403/404/422/304 のとき、ログを抑制する', () => {
      expect(shouldLogStatus(401)).toBe(false)
      expect(shouldLogStatus(403)).toBe(false)
      expect(shouldLogStatus(404)).toBe(false)
      expect(shouldLogStatus(422)).toBe(false)
      expect(shouldLogStatus(304)).toBe(false)
    })

    it('HTTP ステータスが 429 と 5xx のとき、ログを許可する', () => {
      expect(shouldLogStatus(429)).toBe(true)
      expect(shouldLogStatus(500)).toBe(true)
      expect(shouldLogStatus(503)).toBe(true)
    })
  })

  describe('reportHttpError（API用ラッパ）', () => {
    it('404 のとき、本番環境でもログを抑制する', () => {
      vi.stubEnv('NODE_ENV', 'production')

      reportHttpError({
        error: new Error('not-found'),
        status: 404,
        method: 'GET',
        path: '/path',
        component: 'apiFetch',
        withAuth: false,
      })

      expect(Sentry.captureException).not.toHaveBeenCalled()
      expect(spyError).not.toHaveBeenCalled()
    })

    it('500 のとき、本番環境では Error とタグを送る', () => {
      vi.stubEnv('NODE_ENV', 'production')

      reportHttpError({
        error: new Error('server-error'),
        status: 500,
        method: 'POST',
        path: '/items',
        component: 'apiFetch',
        withAuth: true,
        responseBody: '{ "message": "fail" }',
      })

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: {
            component: 'apiFetch',
            method: 'POST',
            path: '/items',
            status: '500',
            withAuth: 'true',
          },
          extra: expect.objectContaining({
            responseBody: expect.stringContaining('"message": "fail"'),
          }),
        }),
      )
    })
  })
})
