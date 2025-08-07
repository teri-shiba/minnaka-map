import { logger } from '~/lib/logger'

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  return (() => {
    let isThrottling = false
    return (...args: Parameters<T>) => {
      if (isThrottling)
        return
      isThrottling = true
      try {
        func(...args)
      }
      catch (error) {
        isThrottling = false
        logger(error, { tags: { component: 'throttle' } })
        throw error
      }
      finally {
        setTimeout(() => isThrottling = false, limit)
      }
    }
  })()
}
