import { logger } from '~/lib/logger'

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let isThrottling = false
  const wait = Math.max(0, Number.isFinite(limit) ? Number(limit) : 0)

  return function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (isThrottling)
      return undefined

    isThrottling = true

    try {
      const result = func.apply(this, args) as ReturnType<T>
      setTimeout(() => isThrottling = false, wait)
      return result
    }
    catch (error) {
      isThrottling = false
      logger(error, { tags: { component: 'throttle' } })
      throw error
    }
  }
}
