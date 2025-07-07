import type { RestaurantListItem } from '~/types/restaurant'
import { LuAlignLeft } from 'react-icons/lu'
import { cn } from '~/utils/cn'
import { Button } from '../buttons/Button'
import RestaurantCard from '../cards/RestaurantCard'
import RestaurantPagination from '../pagination/RestaurantPagination'

interface RestaurantSidebarProps {
  restaurants: RestaurantListItem[]
  currentPage: number
  totalPages: number
  totalCount: number
  className?: string
}

export default function RestaurantSidebar({ restaurants, currentPage, totalPages, totalCount, className }: RestaurantSidebarProps) {
  return (
    <div className={cn('hidden-scrollbar max-h-dvh overflow-y-scroll p-6 md:w-2/5', className)}>
      <div className="flex flex-wrap items-center justify-between">
        <h2 className="text-base">
          検索結果 全
          {totalCount}
          件
        </h2>
        <p className="text-sm">
          <LuAlignLeft className="mb-0.5 mr-1 inline size-3.5" />
          中心地点から近い順
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {totalCount > 0
          ? (
              <>
                {restaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                  />
                ))}
              </>
            )
          : (
              <div className="text-center">
                <p>
                  お店が見つかりませんでした。
                  <br />
                  条件を変えて再検索してください。
                </p>
                <Button>検索条件を変更する</Button>
              </div>
            )}
      </div>

      {totalPages > 1 && (
        <RestaurantPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
