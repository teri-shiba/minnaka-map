'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import RestaurantsDrawer from './drawers/RestaurantsDrawer'
import RestaurantSidebar from './restaurant/RestaurantSidebar'

interface RestaurantListProps {
  restaurants: RestaurantListItem[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export default function RestaurantList({ restaurants, currentPage, totalPages, totalCount }: RestaurantListProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {isDesktop
        ? (
            <RestaurantSidebar
              restaurants={restaurants}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              className="hidden md:block"
            />
          )
        : (
            <RestaurantsDrawer
              restaurants={restaurants}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              className="block md:hidden"
            />
          )}
    </>
  )
}
