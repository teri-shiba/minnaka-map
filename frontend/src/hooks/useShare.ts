'use client'

import { useCallback } from 'react'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { logger } from '~/lib/logger'

export type SharePayload = Pick<ShareData, 'title' | 'text' | 'url'>

type ShareResult
  = | { readonly success: true }
    | { readonly success: false, readonly reason: 'unsupported' | 'failed' }

interface UseShareReturn {
  readonly openNativeShare: (data: SharePayload) => Promise<ShareResult>
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}

export default function useShare(): UseShareReturn {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  const openNativeShare = useCallback(
    async (data: SharePayload): Promise<ShareResult> => {
      if (!canNativeShare || !isMobile)
        return { success: false, reason: 'unsupported' }

      try {
        await navigator.share(data)
        return { success: true }
      }
      catch (error: unknown) {
        // ユーザーキャンセルは成功として扱う
        if (isAbortError(error))
          return { success: true }

        // その他エラーはログに記録して失敗を返す
        logger(error, { component: 'useShare' })
        return { success: false, reason: 'failed' }
      }
    },
    [canNativeShare, isMobile],
  )

  return { openNativeShare }
}
