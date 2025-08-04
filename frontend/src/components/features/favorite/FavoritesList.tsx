'use client'

import type { FavoriteGroupWithDetails, FavoritesPaginationMeta } from '~/types/favorite'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/ui/buttons/Button'
import { getFavoritesWithDetailsPaginated } from '~/services/favorite-action'
import RestaurantCard from '../restaurant/RestaurantCard'

interface FavoriteListProps {
  initialData: FavoriteGroupWithDetails[]
  initialMeta: FavoritesPaginationMeta
}
export default function FavoritesList({ initialData, initialMeta }: FavoriteListProps) {
  const [favorites, setFavorites] = useState(initialData)
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadMore = async () => {
    setIsLoading(true)

    const result = await getFavoritesWithDetailsPaginated(meta.currentPage + 1)

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
        <section key={group.searchHistory.id}>
          <h2 className="text-center">
            {group.searchHistory.stationNames.join('・')}
          </h2>
          <div className="mb-6 space-y-4 border-b py-6 md:mb-10 md:py-10">
            {group.favorites.map(favorite => (
              <RestaurantCard
                key={favorite.id}
                restaurant={favorite.restaurant}
                showFavoriteButton={true}
                searchHistoryId={String(group.searchHistory.id)}
                favoriteId={favorite.id}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="">
        {meta.totalGroups}
        グループ中
        {favorites.length}
        グループ表示
      </div>

      {meta.hasMore && (
        <Button
          onClick={loadMore}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? '読み込み中...' : 'もっと見る'}
        </Button>
      )}
    </>
  )
}
