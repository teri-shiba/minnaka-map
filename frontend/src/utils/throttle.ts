import { logger } from '~/lib/logger'

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let isThrottling: boolean
  return (...args: Parameters<T>) => {
    if (!isThrottling) {
      try {
        func(...args)
      }
      catch (error) {
        isThrottling = false
        logger(error, { tags: { component: 'throttle' } })
        throw error
      }
      isThrottling = true
      setTimeout(() => isThrottling = false, limit)
    }
  }
}
