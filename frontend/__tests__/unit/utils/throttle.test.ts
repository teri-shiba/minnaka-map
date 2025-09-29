import { logger } from '~/lib/logger'
import { throttle } from '~/utils/throttle'

jest.mock('~/lib/logger', () => ({ logger: jest.fn() }))

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('throttle', () => {
  it('最初の呼び出しは即時に実行される', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 1000)
    throttled('a', 1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('a', 1)
  })

  it('間隔中の呼び出しは無視され、limit 経過後は実行される', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 1000)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(999)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('エラー時は logger に記録し、エラーを再スローし、次は即座に実行できる', () => {
    const error = new Error('boom')
    const fn = jest.fn()
      .mockImplementationOnce(() => { throw error })
      .mockImplementation(() => {})
    const throttled = throttle(fn, 1000)

    expect(() => throttled()).toThrow('boom')
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { component: 'throttle' },
      }),
    )
    expect(fn).toHaveBeenCalledTimes(1)

    expect(() => throttled()).not.toThrow()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('引数はそのまま転送される', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 1000)
    throttled('x', 42, { ok: true })
    expect(fn).toHaveBeenCalledWith('x', 42, { ok: true })
  })
})
