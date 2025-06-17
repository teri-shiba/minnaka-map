import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia(query).matches
  }

  const subscribe = (callback: () => void) => {
    const mediaQueryList = window.matchMedia(query)
    mediaQueryList.addEventListener('change', callback)
    return () => mediaQueryList.removeEventListener('change', callback)
  }

  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
