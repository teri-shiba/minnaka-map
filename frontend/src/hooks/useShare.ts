import { useCallback, useState } from 'react'

interface ShareData {
  title: string
  text: string
  url: string
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<void>
  showCustomDialog: boolean
  setShowCustomDialog: (show: boolean) => void
  isWebShareSupported: boolean
}

export function useShare(): UseShareReturn {
  const [showCustomDialog, setShowCustomDialog] = useState<boolean>(false)
  const isWebShareSupported = typeof window !== 'undefined' && 'share' in navigator
  const isMobileDevice = useCallback(() => {
    if (typeof navigator === 'undefined')
      return false

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }, [])

  const share = useCallback(async (data: ShareData) => {
    if (isMobileDevice() && isWebShareSupported) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
        return
      }
      catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        // TODO: エラーハンドリングの修正
        console.warn('Web Share API failed, falling back to custom dialog:', error)
      }
    }

    setShowCustomDialog(true)
  }, [isMobileDevice, isWebShareSupported])

  return {
    share,
    showCustomDialog,
    setShowCustomDialog,
    isWebShareSupported,
  }
}
