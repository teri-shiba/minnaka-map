'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { addFavoriteBySearchHistory } from '~/services/add-favorite-by-search-history'
import { addFavoriteByToken } from '~/services/add-favorite-by-token'
import { checkFavoriteStatus } from '~/services/check-favorite-status'
import { removeFavorite } from '~/services/remove-favorite'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { userStateAtom } from '~/state/user-state.atom'
import { cn } from '~/utils/cn'

interface FavoriteButtonProps {
  hotpepperId: string
  token?: string
  compact?: boolean
  initialHistoryId?: string
  initialFavoriteId?: number
  initialIsFavorite?: boolean
}

export default function FavoriteButton({
  hotpepperId,
  token,
  compact = false,
  initialHistoryId,
  initialFavoriteId,
  initialIsFavorite = false,
}: FavoriteButtonProps) {
  const setModalOpen = useSetAtom(authModalOpenAtom)
  const user = useAtomValue(userStateAtom)
  const isAuthenticated = user.isSignedIn

  const [favoriteId, setFavoriteId] = useState<number | null>(initialFavoriteId ?? null)
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false)
  const [isLoading, setIsLoading] = useState(false)

  const isFromFavoritesPage = Boolean(initialHistoryId && initialFavoriteId !== undefined)
  const [isChecking, setIsChecking] = useState(true)

  const hasValidToken = Boolean(token)

  const canAdd = hasValidToken || Boolean(initialHistoryId)
  const canRemove = Boolean(favoriteId)

  useEffect(() => {
    const initCheck = async () => {
      if (isFromFavoritesPage || !isAuthenticated) {
        setIsChecking(false)
        return
      }

      const historyIdForCheck = initialHistoryId

      if (!historyIdForCheck) {
        setIsChecking(false)
        return
      }

      // TODO: 保存する -> 保存済みがちらつくのを解消する
      try {
        const result = await checkFavoriteStatus(hotpepperId, historyIdForCheck)

        if (!result.success) {
          setIsFavorite(false)
          setFavoriteId(null)
          return
        }

        setIsFavorite(result.data.isFavorite)
        setFavoriteId(result.data.favoriteId)
      }
      finally {
        setIsChecking(false)
      }
    }

    initCheck()
  }, [initialHistoryId, isAuthenticated, hotpepperId, isFromFavoritesPage])

  // TODO: 依存関係が多すぎるので、サイズダウンする
  const handleClick = useCallback(async () => {
    if (isLoading)
      return

    if (!isAuthenticated) {
      setModalOpen(true)
      toast.error('お気に入りの保存にはログインが必要です')
      return
    }

    setIsLoading(true)

    try {
      if (!isFavorite) {
      // お気に入り追加処理
        if (!canAdd) {
          toast.error('検索結果から店舗を選択してください')
          return
        }

        let result

        if (hasValidToken && token) {
          result = await addFavoriteByToken(token)
        }
        else if (initialHistoryId) {
          result = await addFavoriteBySearchHistory(hotpepperId, initialHistoryId)
        }
        else {
          toast.error('お気に入りに保存できませんでした')
          return
        }

        if (!result.success) {
          toast.error(result.message)
          return
        }

        if (result.data.hotpepperId !== hotpepperId) {
          toast.error('この店舗は保存できません。検索結果から選択してください。')
          return
        }

        setIsFavorite(true)
        setFavoriteId(result.data.favoriteId)
        toast.success('お気に入りに追加しました')
      }
      else {
      // お気に入り削除処理
        if (!canRemove) {
          toast.error('お気に入りIDが不正です')
          return
        }

        const result = await removeFavorite(favoriteId!)

        if (result.success === false) {
          toast.error(result.message)
          return
        }

        setIsFavorite(false)
        setFavoriteId(null)
        toast.success('お気に入りから削除しました')
      }
    }
    finally {
      setIsLoading(false)
    }
  }, [
    isFavorite,
    favoriteId,
    isLoading,
    setModalOpen,
    isAuthenticated,
    token,
    hotpepperId,
    canAdd,
    canRemove,
    hasValidToken,
    initialHistoryId,
  ])

  const buttonProps = {
    onClick: handleClick,
    disabled: isChecking || isLoading,
  }

  if (compact) {
    return isChecking
      ? <Skeleton className="size-9 rounded-full shadow-sm" />
      : (
          <Button
            variant="outline"
            size="sm"
            className="size-9 rounded-full bg-white/90 p-0 shadow-sm hover:bg-white"
            {...buttonProps}
          >
            <LuHeart className={cn('h-4 w-4 transition-colors', isFavorite ? 'fill-current text-destructive' : '')} />
          </Button>
        )
  }

  return isChecking
    ? <Skeleton className="h-10 w-32" />
    : (
        <Button variant="outline" className="w-32" {...buttonProps}>
          <LuHeart className={isFavorite ? 'fill-current text-destructive' : ''} />
          {isFavorite ? '保存済み' : '保存する'}
        </Button>
      )
}
