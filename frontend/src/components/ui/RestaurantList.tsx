'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import dynamic from 'next/dynamic'

const RestaurantSidebar = dynamic(
  () => import('./restaurant/RestaurantSidebar'),
)

const RestaurantsDrawer = dynamic(
  () => import('./drawers/RestaurantsDrawer'),
)

interface RestaurantListProps {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
}

export default function RestaurantList({ restaurants, pagination }: RestaurantListProps) {
  // const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {/* PC */}
      <RestaurantSidebar
        restaurants={restaurants}
        pagination={pagination}
        className="hidden md:block"
      />

      {/* SP */}
      <RestaurantsDrawer
        restaurants={restaurants}
        pagination={pagination}
        className="block md:hidden"
      />
    </>
  )
}
