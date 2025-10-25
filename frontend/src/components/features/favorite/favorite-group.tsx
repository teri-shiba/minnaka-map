'use client'

import type { FavoriteGroupWithDetails } from '~/types/favorite'
import type { SharedListData } from '~/types/shared-list'
import { useCallback, useState } from 'react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import useShare from '~/hooks/useShare'
import { createSharedList } from '~/services/create-shared-list'
import RestaurantCard from '../restaurant/restaurant-card'
import ShareFavoriteListDialog from './share/share-favorite-list-dialog'

interface FavoriteGroupProps {
  group: FavoriteGroupWithDetails
}

const INITIAL_DISPLAY_COUNT = 3

export default function FavoriteGroup({ group }: FavoriteGroupProps) {
  const [showAll, setShowAll] = useState(false)
  const { openNativeShare } = useShare()
  const [isSharing, setIsSharing] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareData, setShareData] = useState<SharedListData | null>(null)
  const [shareUrl, setShareUrl] = useState('')

  const displayFavorites = showAll
    ? group.favorites
    : group.favorites.slice(0, INITIAL_DISPLAY_COUNT)

  const hasMore = group.favorites.length > INITIAL_DISPLAY_COUNT
  const remainingCount = group.favorites.length - INITIAL_DISPLAY_COUNT

  const handleToggle = useCallback(() => setShowAll(prev => !prev), [])

  const handleShare = useCallback(async () => {
    setIsSharing(true)

    try {
      const createResult = await createSharedList(group.searchHistory.id)

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
      if (shareResult.success)
        return

      setShareData(createResult.data)
      setShareUrl(generatedUrl)
      setShareDialogOpen(true)
    }
    finally {
      setIsSharing(false)
    }
  }, [group.searchHistory.id, openNativeShare])

  return (
    <section>
      <h2 className="text-center">
        {group.searchHistory.stationNames.join('・')}
      </h2>
      <div className="mb-6 mt-4 text-center md:mb-10">
        <ShareFavoriteListDialog
          isOpen={shareDialogOpen}
          onClick={handleShare}
          isDisabled={isSharing}
          onClose={() => setShareDialogOpen(false)}
          shareUrl={shareUrl}
          title={shareData?.title}
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
