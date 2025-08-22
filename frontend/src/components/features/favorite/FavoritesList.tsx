'use client'

import type { FavoriteGroupWithDetails, FavoritesPaginationMeta } from '~/types/favorite'
import Link from 'next/link'
import { useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import { Button } from '~/components/ui/buttons/Button'
import { getFavoritesWithDetailsPaginated } from '~/services/favorite-action'
import FavoriteGroup from './FavoriteGroup'

interface FavoriteListProps {
  initialData: FavoriteGroupWithDetails[]
  initialMeta: FavoritesPaginationMeta
}

export default function FavoritesList({ initialData, initialMeta }: FavoriteListProps) {
  const [favorites, setFavorites] = useState(initialData)
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = async () => {
    setIsLoading(true)

    const result = await getFavoritesWithDetailsPaginated(meta.currentPage + 1, 3)

    if (result.success) {
      setFavorites(prev => [...prev, ...result.data])
      setMeta(result.meta)
    }

    setIsLoading(false)
  }

  if (favorites.length === 0) {
    return (
      <div className="my-10 text-center">
        <h2 className="mb-2">まだお気に入りが登録されていません。</h2>
        <p className="mb-6">複数の駅で検索したお店を保存して、みんなにシェアしてみませんか？</p>
        <Button asChild size="lg">
          <Link href="/">今すぐ検索する</Link>
        </Button>
      </div>
    )
  }
  return (
    <>
      {favorites.map(group => (
        <FavoriteGroup
          key={group.searchHistory.id}
          group={group}
        />
      ))}

      <div className="flex flex-col items-center justify-center gap-4">
        {meta.hasMore
          ? (
              <>
                <p>
                  {`全 ${favorites.length} 件中 ${meta.totalGroups} 件を表示中`}
                </p>
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? '読み込み中...' : 'さらに読み込む'}
                </Button>
              </>
            )
          : (
              <>
                <div className="flex size-10 items-center justify-center rounded-full bg-red-50">
                  <LuHeart className="fill-destructive text-destructive" />
                </div>
                <p>すべてのお気に入りを表示しました</p>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  size="lg"
                  asChild
                >
                  {isLoading ? '読み込み中...' : <Link href="/">別のエリアを探す</Link>}
                </Button>
              </>
            )}
      </div>
    </>
  )
}
