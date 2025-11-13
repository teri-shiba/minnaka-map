'use client'

import type { SharedListData } from '~/types/shared-list'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { createSharedList } from '~/services/create-shared-list'
import useShare from './useShare'

interface UseFavoriteShareParams {
  searchHistoryId: number
}

interface ShareDialogState {
  data: SharedListData
  url: string
}

export function useFavoriteShare({ searchHistoryId }: UseFavoriteShareParams) {
  const { openNativeShare } = useShare()
  const [isSharing, setIsSharing] = useState(false)
  const [dialogState, setDialogState] = useState<ShareDialogState | null>(null)

  const handleShare = useCallback(async () => {
    setIsSharing(true)

    try {
      const createResult = await createSharedList(searchHistoryId)

      if (!createResult.success) {
        toast.error(createResult.message)
        return
      }

      const { shareUuid, title } = createResult.data

      const generatedUrl = new URL(
        `/shared/${shareUuid}`,
        process.env.NEXT_PUBLIC_FRONT_BASE_URL,
      ).toString()

      const payload = {
        title: `${title}のおすすめリスト`,
        text: `${title}のおすすめレストランをチェック！`,
        url: generatedUrl,
      }

      const shareResult = await openNativeShare(payload)

      if (!shareResult.success) {
        setDialogState({
          data: createResult.data,
          url: generatedUrl,
        })
      }
    }
    finally {
      setIsSharing(false)
    }
  }, [openNativeShare, searchHistoryId])

  const closeDialog = useCallback(() => {
    setDialogState(null)
  }, [])

  return {
    isSharing,
    dialogState,
    handleShare,
    closeDialog,
  }
}
