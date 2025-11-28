'use client'

import type { FavoriteGroupWithDetails } from '~/types/favorite'
import { useCallback, useState } from 'react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { useFavoriteShare } from '~/hooks/useFavoriteShare'
import RestaurantCard from '../restaurant/restaurant-card'
import ShareFavoriteListDialog from './share/share-favorite-list-dialog'

const INITIAL_DISPLAY_COUNT = 3

export default function FavoriteGroup({ group }: { group: FavoriteGroupWithDetails }) {
  const [showAll, setShowAll] = useState(false)
  const { isSharing, dialogState, handleShare, closeDialog } = useFavoriteShare({
    searchHistoryId: group.searchHistory.id,
  })

  const displayFavorites = showAll
    ? group.favorites
    : group.favorites.slice(0, INITIAL_DISPLAY_COUNT)

  const hasMore = group.favorites.length > INITIAL_DISPLAY_COUNT
  const remainingCount = group.favorites.length - INITIAL_DISPLAY_COUNT

  const handleToggle = useCallback(() => setShowAll(prev => !prev), [])

  return (
    <section>
      <h2 className="pb-4 text-center">
        {group.searchHistory.stationNames.join('・')}
      </h2>
      <div className="mb-6 text-center md:mb-10">
        <ShareFavoriteListDialog
          isOpen={dialogState !== null}
          onClick={handleShare}
          isDisabled={isSharing}
          onClose={closeDialog}
          shareUrl={dialogState?.url}
          title={dialogState?.data.title}
        />
      </div>
      <div className="mb-6 space-y-4 border-b pb-6 md:mb-10 md:pb-10">
        {displayFavorites.map(favorite => (
          <RestaurantCard
            key={favorite.id}
            restaurant={favorite.restaurant}
            showFavoriteButton={true}
            searchHistoryId={String(group.searchHistory.id)}
            favoriteId={favorite.id}
          />
        ))}

        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="font-normal"
            >
              {showAll ? <LuChevronUp /> : <LuChevronDown />}
              <span>
                {`他 ${remainingCount} 件を${showAll ? '非表示' : '表示'}`}
              </span>
            </Button>
          </div>
        )}

      </div>
    </section>
  )
}
