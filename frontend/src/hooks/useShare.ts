'use client'

import { useCallback } from 'react'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { logger } from '~/lib/logger'

export type SharePayload = Pick<ShareData, 'title' | 'text' | 'url'>

type ShareResult
  = | { readonly ok: true }
    | { readonly ok: false, readonly reason: 'unsupported' | 'failed' }

interface UseShareReturn {
  readonly share: (data: SharePayload) => Promise<ShareResult>
  readonly isMobile: boolean
  readonly canNativeShare: boolean
}

function isAbortError(error: unknown): boolean {
  return !!(
    error
    && typeof error === 'object'
    && 'name' in error
    && (error as { name?: string }).name === 'AbortError'
  )
}

export default function useShare(): UseShareReturn {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  const share = useCallback(
    async (data: SharePayload): Promise<ShareResult> => {
      if (!(canNativeShare && isMobile))
        return { ok: false, reason: 'unsupported' }

      try {
        await navigator.share(data)
        return { ok: true }
      }
      catch (error: unknown) {
        if (isAbortError(error))
          return { ok: true }

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
