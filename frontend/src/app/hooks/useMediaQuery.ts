import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', notify)
      return () => mediaQueryList.removeEventListener('change', notify)
    },

    () => window.matchMedia(query).matches,
  )
}
