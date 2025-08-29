'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Button } from '~/components/ui/button'
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
      className={cn('hidden-scrollbar max-h-dvh overflow-y-scroll p-6 md:w-2/5 md:min-w-[24rem]', className)}
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

                <div className="mt-4 space-y-2 rounded-lg bg-gray-50/50 p-4">
                  {totalPages > 1 && (
                    <RestaurantPagination
                      pagination={pagination}
                    />
                  )}

                  <p className="text-center text-xs text-muted-foreground">
                    Powered by
                    {' '}
                    <a
                      href="http://webservice.recruit.co.jp/"
                      className="text-sky-600"
                    >
                      ホットペッパーグルメ Webサービス
                    </a>
                  </p>
                </div>
              </>
            )
          : (
              <div className="text-center">
                <p className="text-sm leading-relaxed">
                  お店が見つかりませんでした。
                  <br />
                  条件を変えて再検索してください。
                </p>
                <Link href="/" className="mt-4 inline-block">
                  <Button>
                    再検索する
                  </Button>
                </Link>
              </div>
            )}
      </div>

    </div>
  )
}
