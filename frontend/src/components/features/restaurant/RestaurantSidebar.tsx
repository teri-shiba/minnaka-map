'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { useEffect, useRef } from 'react'
import { LuAlignLeft } from 'react-icons/lu'
import { Button } from '~/ui/buttons/Button'
import { cn } from '~/utils/cn'
import RestaurantCard from './RestaurantCard'
import RestaurantPagination from './RestaurantPagination'

interface RestaurantSidebarProps {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
  className?: string
}

export default function RestaurantSidebar({
  restaurants,
  pagination,
  className,
}: RestaurantSidebarProps) {
  const { totalCount, totalPages, currentPage } = pagination
  const scrollContaierRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContaierRef.current) {
      scrollContaierRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [currentPage])

  return (
    <div
      ref={scrollContaierRef}
      className={cn('hidden-scrollbar max-h-dvh overflow-y-scroll p-6 md:w-2/5', className)}
    >
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
          pagination={pagination}
        />
      )}
    </div>
  )
}
