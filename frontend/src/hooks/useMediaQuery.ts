'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

interface UseMediaQueryOptions {
  defaultMatches?: boolean
  noSsr?: boolean
}

export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultMatches = false, noSsr = false } = options

  const mediaQueryList = useMemo(() => {
    if (typeof window === 'undefined')
      return null
    return window.matchMedia(query)
  }, [query])

  const subscribe = useCallback((callback: () => void) => {
    if (!mediaQueryList)
      return () => {}

    mediaQueryList.addEventListener('change', callback)
    return () => mediaQueryList.removeEventListener('change', callback)
  }, [mediaQueryList])

  const getSnapshot = useCallback(() => {
    if (!mediaQueryList)
      return defaultMatches
    return mediaQueryList.matches
  }, [mediaQueryList, defaultMatches])

  const getServerSnapshot = useCallback(() => {
    if (noSsr && typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return defaultMatches
  }, [defaultMatches, noSsr, query])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
