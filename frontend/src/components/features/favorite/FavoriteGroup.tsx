'use client'
import type { FavoriteGroupWithDetails } from '~/types/favorite'
import { useState } from 'react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { Button } from '~/components/ui/buttons/Button'
import RestaurantCard from '../restaurant/RestaurantCard'

interface FavoriteGroupProps {
  group: FavoriteGroupWithDetails
}

export default function FavoriteGroup({ group }: FavoriteGroupProps) {
  const [showAll, setShowAll] = useState<boolean>(false)

  const INITIAL_DISPLAY_COUNT = 3
  const displayFavorites = showAll
    ? group.favorites
    : group.favorites.slice(0, INITIAL_DISPLAY_COUNT)

  const hasMore = group.favorites.length > INITIAL_DISPLAY_COUNT
  const remainingCount = group.favorites.length - INITIAL_DISPLAY_COUNT

  return (
    <section key={group.searchHistory.id}>
      <h2 className="text-center">
        {group.searchHistory.stationNames.join('・')}
      </h2>
      <div className="mb-6 space-y-4 border-b py-6 md:mb-10 md:py-10">
        {displayFavorites.map(favorite => (
          <RestaurantCard
            key={favorite.id}
            restaurant={favorite.restaurant}
            showFavoriteButton={true}
            searchHistoryId={String(group.searchHistory.id)}
            favoriteId={favorite.id}
          />
        ))}

        <div className="text-center">
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="font-normal"
            >
              {showAll ? <LuChevronUp /> : <LuChevronDown />}
              <span>
                {`他 ${remainingCount} 件を${showAll ? '非表示' : '表示'}`}
              </span>
            </Button>
          )}
        </div>

      </div>
    </section>
  )
}
