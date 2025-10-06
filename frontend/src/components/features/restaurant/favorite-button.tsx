'use client'

import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { getErrorMessage } from '~/lib/get-error-message'
import { logger } from '~/lib/logger'
import { addToFavorites, checkFavoriteStatus, removeFromFavorites } from '~/services/favorite-action'
import { saveSearchHistory } from '~/services/save-search-history'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { userStateAtom } from '~/state/user-state.atom'
import { isServiceSuccess } from '~/types/service-result'
import { cn } from '~/utils/cn'

interface FavoriteButtonProps {
  hotpepperId: string
  compact?: boolean
  initialHistoryId?: string
  initialFavoriteId?: number
  initialIsFavorite?: boolean
}

interface FavoriteActionResult {
  success: boolean
  favoriteId?: number
}

export default function FavoriteButton({
  hotpepperId,
  compact = false,
  initialHistoryId,
  initialFavoriteId,
  initialIsFavorite = false,
}: FavoriteButtonProps) {
  const router = useRouter()
  const setModalOpen = useSetAtom(authModalOpenAtom)
  const [userState] = useAtom(userStateAtom)
  const isSignedIn = userState.isSignedIn

  const [historyId, setHistoryId] = useState<string | null>(() =>
    initialHistoryId ?? (typeof window !== 'undefined' ? sessionStorage.getItem('pendingSearchHistoryId') : null),
  )
  const [favoriteId, setFavoriteId] = useState<number | null>(initialFavoriteId ?? null)
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false)

  const [isLoading, setIsLoading] = useState(false)

  const isFromFavoritesPage = Boolean(initialHistoryId && initialFavoriteId !== undefined)
  const [isChecking, setIsChecking] = useState(!initialHistoryId)

  useEffect(() => {
    const initCheck = async () => {
      if (isFromFavoritesPage || !isSignedIn || !historyId) {
        setIsChecking(false)
        return
      }

      try {
        const status = await checkFavoriteStatus(hotpepperId, historyId)
        setIsFavorite(status.isFavorite)
        setFavoriteId(status.favoriteId ?? null)
      }
      catch (err) {
        logger(err, { tags: { component: 'FavoriteButton - initCheck' } })
      }
      finally {
        setIsChecking(false)
      }
    }

    initCheck()
  }, [initialHistoryId, historyId, isSignedIn, hotpepperId, isFromFavoritesPage])

  const handleClick = useCallback(async () => {
    if (isLoading)
      return

    let currentHistoryId = historyId
    if (!currentHistoryId) {
      const raw = sessionStorage.getItem('pendingStationIds')
      const stationIds = raw ? JSON.parse(raw) as number[] : []

      if (stationIds.length <= 1) {
        router.push('/?error=search_context_missing')
        return
      }

      const result = await saveSearchHistory(stationIds)

      if (!isServiceSuccess(result)) {
        if (result.cause === 'UNAUTHORIZED')
          setModalOpen(true)

        toast.error(getErrorMessage(result, 'お気に入りの保存'))
        return
      }

      currentHistoryId = String(result.data.searchHistoryId)
      sessionStorage.setItem('pendingSearchHistoryId', currentHistoryId)
      setHistoryId(currentHistoryId)
    }

    setIsLoading(true)

    try {
      if (!isFavorite) {
        // 追加処理
        const result: FavoriteActionResult = await addToFavorites(hotpepperId, Number(currentHistoryId))
        if (!result.success || !result.favoriteId)
          throw new Error('追加失敗')
        setIsFavorite(true)
        setFavoriteId(result.favoriteId)
        toast.success('お気に入りに追加しました')
      }
      else {
        // 削除処理
        if (!favoriteId)
          throw new Error('ID不正')
        const result: FavoriteActionResult = await removeFromFavorites(favoriteId)
        if (!result.success)
          throw new Error('削除失敗')
        setIsFavorite(false)
        setFavoriteId(null)
        toast.success('お気に入りから削除しました')
      }
    }
    catch (error) {
      logger(error, { tags: { component: 'FavoriteButton' } })

      toast.error(
        !isFavorite
          ? 'お気に入りの追加に失敗しました。時間をおいて再度お試しください。'
          : 'お気に入りの削除に失敗しました。時間をおいて再度お試しください。',
      )
    }
    finally {
      setIsLoading(false)
    }
  }, [isFavorite, favoriteId, hotpepperId, historyId, isLoading, setHistoryId, setModalOpen, router])

  const buttonProps = { onClick: handleClick, disabled: isChecking || isLoading }

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
