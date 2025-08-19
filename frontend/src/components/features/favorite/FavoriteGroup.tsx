'use client'

import type { SharedListData } from '~/services/create-shared-list'
import type { FavoriteGroupWithDetails } from '~/types/favorite'
import { useCallback, useState } from 'react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/buttons/Button'
import ShareFavoriteListDialog from '~/components/ui/dialogs/ShareFavoriteListDialog'
import useShare from '~/hooks/useShare'
import { logger } from '~/lib/logger'
import { createSharedList } from '~/services/create-shared-list'
import RestaurantCard from '../restaurant/RestaurantCard'

interface FavoriteGroupProps {
  group: FavoriteGroupWithDetails
}

const INITIAL_DISPLAY_COUNT = 3

export default function FavoriteGroup({ group }: FavoriteGroupProps) {
  const [showAll, setShowAll] = useState<boolean>(false)
  const { share, canNativeShare, isMobile } = useShare()
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false)
  const [shareData, setShareData] = useState<SharedListData | null> (null)
  const [shareUrl, setShareUrl] = useState<string>('')

  const displayFavorites = showAll
    ? group.favorites
    : group.favorites.slice(0, INITIAL_DISPLAY_COUNT)

  const hasMore = group.favorites.length > INITIAL_DISPLAY_COUNT
  const remainingCount = group.favorites.length - INITIAL_DISPLAY_COUNT

  const handleToggle = useCallback(() => setShowAll(prev => !prev), [])

  const handleShare = useCallback(async () => {
    setIsSharing(true)

    try {
      const result = await createSharedList(group.searchHistory.id)

      if (!result.success) {
        toast.error('シェア作成に失敗しました')
        return
      }

      const generateShareUrl = new URL(
        `/shared/${result.data!.share_uuid}`,
        process.env.NEXT_PUBLIC_FRONT_BASE_URL,
      ).toString()

      const sharePayload = {
        title: `${result.data!.title}のおすすめリスト`,
        text: `${result.data!.title}のおすすめレストランをチェック！`,
        url: generateShareUrl,
      }

      if (canNativeShare && isMobile) {
        const response = await share(sharePayload)
        if (response.ok)
          return
      }

      setShareData(result.data!)
      setShareUrl(generateShareUrl)
      setShareDialogOpen(true)
    }
    catch (error) {
      logger(error, { tags: { component: 'handleShare - FavoriteGroup' } })
      toast.error('予期しないエラーが発生しました')
    }
    finally {
      setIsSharing(false)
    }
  }, [canNativeShare, group.searchHistory.id, isMobile, share])

  return (
    <section key={group.searchHistory.id}>
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

        <div className="text-center">
          {hasMore && (
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
          )}
        </div>

      </div>
    </section>
  )
}
