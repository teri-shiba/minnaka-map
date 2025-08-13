import { useCallback, useMemo } from 'react'
import { logger } from '~/lib/logger'
import { useMediaQuery } from '~/hooks/useMediaQuery'

interface ShareData {
  title: string
  text: string
  url: string
}

type ShareResult =
  | { readonly ok: true }
  | { readonly ok: false, readonly reason: 'unsupported' | 'failed' }

type SharePayload = Pick<ShareData, 'title' | 'text' | 'url'>

interface UseShareReturn {
  readonly share: (data: SharePayload) => Promise<ShareResult>
  readonly isMobile: boolean
  readonly canNativeShare: boolean
}

export function useShare(): UseShareReturn {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const canNativeShare = useMemo(
    () => typeof navigator !== 'undefined' && 'share' in navigator,
    [],
  )

  const share = useCallback(
    async (data: SharePayload): Promise<ShareResult> => {
      if (!(canNativeShare && isMobile)) {
        return { ok: false, reason: 'unsupported' }
      }
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
        return { ok: true }
      }
      catch (error: unknown) {
        if (
          error
          && typeof error === 'object'
          && 'name' in error
          && (error as { name?: string }).name === 'AbortError'
        ) {
          return { ok: true }
        }

        logger(error, {
          message: 'share failed',
          tags: { component: 'useShare' },
        })

        return { ok: false, reason: 'failed' }
      }
    },
    [canNativeShare, isMobile],
  )

  return { canNativeShare, share, isMobile }
}
