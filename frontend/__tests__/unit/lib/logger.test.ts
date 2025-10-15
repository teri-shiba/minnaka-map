import * as Sentry from '@sentry/nextjs'
import { ApiError } from '~/lib/api-error'
import { logger, shouldLogStatus } from '~/lib/logger'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

function buildApiError(status: number, message: string): unknown {
  return Object.assign(Object.create(ApiError.prototype), {
    name: 'ApiError',
    status,
    message,
  })
}

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
    it('本番では、Sentry.captureException をタグ・追加情報付きで呼ぶ', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = new Error('error')
      const context = {
        component: 'userForm',
        action: 'submit',
        extra: { userId: 'USERID' },
      }

      logger(error, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            component: 'userForm',
            action: 'submit',
          },
          extra: { userId: 'USERID' },
        }),
      )
      expect(spyError).not.toHaveBeenCalled()
    })

    it('非本番のとき、console.error に [error, captureContext] を出力する', () => {
      vi.stubEnv('NODE_ENV', 'test')
      const error = new Error('error')
      const context = {
        component: 'userForm',
        action: 'submit',
        extra: { userId: 'USERID' },
      }

      logger(error, context)

      expect(spyError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            component: 'userForm',
            action: 'submit',
          },
          extra: { userId: 'USERID' },
        }),
      )
      expect(Sentry.captureException).not.toHaveBeenCalled()
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

  describe('ApiError 連携（ステータスでタグ化/抑制）', () => {
    it('HTTP ステータスが 404 のとき、本番環境では送信しない', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = buildApiError(404, 'ページが見つかりません')
      const context = { component: 'shareList' }

      logger(error, context)

      expect(Sentry.captureException).not.toHaveBeenCalled()
      expect(spyError).not.toHaveBeenCalled()
    })

    it('HTTP ステータスが 500 のとき、本番環境では status をタグに含めて Sentry に送信する', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const error = buildApiError(500, 'サーバーエラーが発生しました')
      const context = { component: 'shareList' }

      logger(error, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            component: 'shareList',
            status: '500',
          },
        }),
      )
    })
  })
})
