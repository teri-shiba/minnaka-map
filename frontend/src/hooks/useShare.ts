import { useCallback } from 'react'
import { useMediaQuery } from './useMediaQuery'

interface ShareData {
  title: string
  text: string
  url: string
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<void>
}

export function useShare(): UseShareReturn {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const share = useCallback(async (data: ShareData) => {
    if (
      typeof navigator !== 'undefined'
      && 'share' in navigator
      && isMobile
    ) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
      }
      catch (error) {
        if (error instanceof Error && error.name === 'AbortError')
          return

        // TODO: エラーハンドリングの修正
        console.warn('Web Share API failed, falling back to custom dialog:', error)
      }
    }
  }, [isMobile])
  return { share }
}
