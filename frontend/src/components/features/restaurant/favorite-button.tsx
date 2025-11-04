'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useOptimistic, useState, useTransition } from 'react'
import { LuHeart } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { addFavoriteBySearchHistory } from '~/services/add-favorite-by-search-history'
import { addFavoriteByToken } from '~/services/add-favorite-by-token'
import { removeFavorite } from '~/services/remove-favorite'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { userStateAtom } from '~/state/user-state.atom'
import { cn } from '~/utils/cn'

interface FavoriteButtonProps {
  hotpepperId: string
  initialIsFavorite: boolean
  initialFavoriteId: number | null
  token?: string
  initialHistoryId?: string
  compact?: boolean
}

export default function FavoriteButton({
  hotpepperId,
  initialIsFavorite,
  initialFavoriteId,
  token,
  initialHistoryId,
  compact = false,
}: FavoriteButtonProps) {
  const setModalOpen = useSetAtom(authModalOpenAtom)
  const user = useAtomValue(userStateAtom)
  const auth = user.isSignedIn

  const [, startTransition] = useTransition()
  const [response, setResponse] = useState({
    isFavorite: initialIsFavorite,
    favoriteId: initialFavoriteId ?? null,
  })

  const [optimisticResponse, setOptimisticResponse] = useOptimistic(
    response,
    (_, newValue: { isFavorite: boolean, favoriteId: number | null }) => newValue,
  )

  const handleAdd = useCallback(async () => {
    if (!auth) {
      setModalOpen(true)
      toast.error('お気に入りの保存にはログインが必要です')
      return
    }

    if (!token && !initialHistoryId) {
      toast.error('検索結果から店舗を選択してください')
      return
    }

    startTransition(async () => {
      setOptimisticResponse({ isFavorite: true, favoriteId: null })

      try {
        let result

        if (token) {
          result = await addFavoriteByToken(token)
        }
        else if (initialHistoryId) {
          result = await addFavoriteBySearchHistory(hotpepperId, initialHistoryId)
        }
        else {
          toast.error('お気に入りに保存できませんでした')
          return
        }

        if (!result.success || result.data.hotpepperId !== hotpepperId) {
          toast.error('この店舗は保存できません。検索結果から選択してください。')
          return
        }

        setResponse({ isFavorite: true, favoriteId: result.data.favoriteId })
        toast.success('お気に入りに追加しました')
      }
      catch {
        setResponse(response)
        toast.error('処理に失敗しました')
      }
    })
  }, [auth, token, hotpepperId, initialHistoryId, setModalOpen, setOptimisticResponse, response])

  const handleRemove = useCallback(async () => {
    startTransition(async () => {
      setOptimisticResponse({ isFavorite: false, favoriteId: null })

      try {
        const result = await removeFavorite(optimisticResponse.favoriteId!)

        if (!result.success) {
          toast.error(result.message)
          return
        }

        setResponse({ isFavorite: false, favoriteId: null })
        toast.success('お気に入りから削除しました')
      }
      catch {
        setResponse(response)
        toast.error('処理に失敗しました')
      }
    })
  }, [optimisticResponse.favoriteId, setOptimisticResponse, response])

  return (
    <Button
      variant="outline"
      size={compact ? 'sm' : undefined}
      className={cn(
        compact
          ? 'size-9 rounded-full bg-white/90 p-0 shadow-sm hover:bg-white'
          : 'w-32',
      )}
      onClick={optimisticResponse.isFavorite ? handleRemove : handleAdd}
    >
      <LuHeart
        className={cn(
          'transition-colors',
          compact && 'h-4 w-4',
          optimisticResponse.isFavorite && 'fill-current text-destructive',
        )}
      />
      {!compact && (optimisticResponse.isFavorite ? '保存済み' : '保存する')}
    </Button>
  )
}
