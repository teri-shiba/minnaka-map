import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => {
      setValue(event.matches)
    }

    mediaQueryList.addEventListener('change', onChange)
    return () => {
      mediaQueryList.removeEventListener('change', onChange)
    }
  }, [query])

  return value
}
