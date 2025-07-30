'use client'

import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/buttons/Button'
import { logger } from '~/lib/logger'
import { addToFavorites, removeFromFavorites } from '~/services/favorite-action'
import { userStateAtom } from '~/state/user-state.atom'
import { cn } from '~/utils/cn'

interface FavoriteButtonProps {
  initialIsFavorite: boolean
  initialFavoriteId: number | null
  hotPepperId: string
  searchHistoryId: string
  compact?: boolean
  className?: string
}

interface FavoriteActionResult {
  success: boolean
  favoriteId?: number
}

export default function FavoriteButton({
  initialIsFavorite,
  initialFavoriteId,
  hotPepperId,
  searchHistoryId,
  compact = false,
  className,
}: FavoriteButtonProps) {
  const [userState] = useAtom(userStateAtom)
  const isSignedIn = userState.isSignedIn

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [favoriteId, setFavoriteId] = useState(initialFavoriteId) // TODO:なぜ必要なのか確認
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleClick = useCallback(async () => {
    if (isLoading)
      return

    if (!isSignedIn) {
      toast.error('お気に入りに登録するには、ログインが必要です')
      return
    }

    setIsLoading(true)

    try {
      if (!isFavorite) {
        // 追加処理
        const result: FavoriteActionResult = await addToFavorites(hotPepperId, Number(searchHistoryId))
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
  }, [isSignedIn, isFavorite, searchHistoryId, favoriteId, hotPepperId, isLoading])

  const buttonProps = {
    onClick: handleClick,
    disabled: isLoading,
  }

  if (compact) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-sm rounded-full', className)}
        {...buttonProps}
      >
        <LuHeart
          className={cn(
            'h-4 w-4 transition-colors',
            isFavorite ? 'fill-current text-destructive' : '',
          )}
        />
      </Button>
    )
  }

  return (
    <Button variant="outline" className="w-32" {...buttonProps}>
      <LuHeart className={isFavorite ? 'fill-current text-destructive' : ''} />
      {isFavorite ? '保存済み' : '保存する'}
    </Button>
  )
}
