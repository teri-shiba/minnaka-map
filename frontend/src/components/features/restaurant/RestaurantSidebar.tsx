'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { useEffect, useRef } from 'react'
import { Button } from '~/ui/buttons/Button'
import { cn } from '~/utils/cn'
import RestaurantCard from './RestaurantCard'
import RestaurantListHeader from './RestaurantListHeader'
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
      <RestaurantListHeader totalCount={totalCount} />

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
