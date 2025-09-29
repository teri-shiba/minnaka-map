import * as Sentry from '@sentry/nextjs'
import { logger } from '~/lib/logger'

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

function setNodeEnv(value: 'production' | 'test' = 'test') {
  (process.env as Record<string, string | undefined>).NODE_ENV = value
}

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV
  const spyError = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
    setNodeEnv(originalEnv === 'production' ? 'production' : 'test')
  })

  afterAll(() => {
    setNodeEnv(originalEnv === 'production' ? 'production' : 'test')
    spyError.mockRestore()
  })

  it('本番では、Sentry.captureException を呼ぶ', () => {
    setNodeEnv('production')
    const error = new Error('error')
    const context = { key: 'value' }

    logger(error, context)

    expect(Sentry.captureException).toHaveBeenCalledWith(error, { extra: context })
    expect(spyError).not.toHaveBeenCalled()
  })

  it('非本番では、console.error に出力する', () => {
    setNodeEnv('test')
    const error = new Error('error')
    const context = { key: 'value' }

    logger(error, context)

    expect(spyError).toHaveBeenCalledWith(error, { extra: context })
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('context が未指定でもエラーなく動作する', () => {
    setNodeEnv('production')
    const error = new Error('no-context')

    logger(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error, undefined)
  })

  it('tags を渡すと Sentry のタグとして記録される', () => {
    setNodeEnv('production')
    const error = new Error('error')

    logger(error, { tags: { component: 'componentName' } })

    expect(Sentry.captureException).toHaveBeenCalledWith(error, { tags: { component: 'componentName' } })
  })
})
