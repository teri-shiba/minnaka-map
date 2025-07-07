'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import RestaurantsDrawer from './drawers/RestaurantsDrawer'
import RestaurantSidebar from './restaurant/RestaurantSidebar'

interface RestaurantListProps {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
}

export default function RestaurantList({ restaurants, pagination }: RestaurantListProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {isDesktop
        ? (
            <RestaurantSidebar
              restaurants={restaurants}
              pagination={pagination}
              className="hidden md:block"
            />
          )
        : (
            <RestaurantsDrawer
              restaurants={restaurants}
              pagination={pagination}
              className="block md:hidden"
            />
          )}
    </>
  )
}
