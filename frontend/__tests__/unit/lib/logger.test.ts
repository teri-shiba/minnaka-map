import * as Sentry from '@sentry/nextjs'
import { logger } from '~/lib/logger'

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
