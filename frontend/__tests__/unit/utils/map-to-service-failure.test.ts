import type { ServiceFailure } from '~/types/service-result'
import { logger } from '~/lib/logger'
import { ApiError, handleApiError } from '~/services/api-client'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

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
