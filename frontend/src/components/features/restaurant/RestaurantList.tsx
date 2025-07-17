'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import dynamic from 'next/dynamic'

const RestaurantSidebar = dynamic(
  () => import('./RestaurantSidebar'),
)

const RestaurantsDrawer = dynamic(
  () => import('./RestaurantsDrawer'),
)

interface RestaurantListProps {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
}

export default function RestaurantList({ restaurants, pagination }: RestaurantListProps) {
  return (
    <>
      {/* PC */}
      <RestaurantSidebar
        restaurants={restaurants}
        pagination={pagination}
        className="hidden md:block md:shrink-0"
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
