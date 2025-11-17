import type { ReactNode } from 'react'
import type { Middleware, SWRHook } from 'swr'
import { SWRConfig } from 'swr'

// モックデータを返す SWR middleware
// パターンマッチングでデータを返す
export function createSWRMockData(mockData: Record<string, any>): Middleware {
  return (useSWRNext: SWRHook) => {
    return (key, fetcher, config) => {
      const mockedFetcher = key
        ? async () => {
          const keyStr = typeof key === 'string' ? key : JSON.stringify(key)

          // パターンを長い順にソート
          const sortedPatterns = Object.entries(mockData).sort(
            ([a], [b]) => b.length - a.length,
          )

          for (const [pattern, data] of sortedPatterns) {
            if (keyStr.includes(pattern)) {
              if (data instanceof Error) {
                throw data
              }
              return data
            }
          }

          return { stations: [] }
        }
        : fetcher

      return useSWRNext(key, mockedFetcher, config)
    }
  }
}

// fetcher の呼び出し回数を追跡する SWR middleware
export function createSWRCallTracker(mockStations: any[]) {
  let fetcherCallCount = 0

  const middleware: Middleware = (useSWRNext: SWRHook) => {
    return (key, fetcher, config) => {
      const trackedFetcher = key
        ? (async () => {
            fetcherCallCount++
            return { stations: mockStations }
          }) as any
        : fetcher

      return useSWRNext(key, trackedFetcher, config)
    }
  }

  return {
    middleware,
    getCallCount: () => fetcherCallCount,
  }
}

// テスト用の SWR wrapper を作成
export function createSWRWrapper(options?: {
  mockData?: Record<string, any>
  middleware?: Middleware | Middleware[]
}) {
  const middlewares: Middleware[] = []

  if (options?.mockData)
    middlewares.push(createSWRMockData(options.mockData))

  if (options?.middleware) {
    const additionalMiddlewares = Array.isArray(options.middleware)
      ? options.middleware
      : [options.middleware]

    middlewares.push(...additionalMiddlewares)
  }

  return ({ children }: { children: ReactNode }) => (
    <SWRConfig
      value={{
        provider: () => new Map(),
        use: middlewares,
        dedupingInterval: 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
