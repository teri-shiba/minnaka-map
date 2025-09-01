'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { useMemo } from 'react'
import RestaurantCard from './restaurant-card'
import RestaurantEmpty from './restaurant-empty'
import RestaurantListFooter from './restaurant-list-footer'

interface Props {
  restaurants: RestaurantListItem[]
  totalCount: number
  pagination: PageInfo
  isMobile: boolean
}

export default function RestaurantListBody({ restaurants, totalCount, pagination, isMobile }: Props) {
  const listItems = useMemo(() => {
    return restaurants.map(restaurant => (
      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
    ))
  }, [restaurants])

  if (totalCount <= 0)
    return <RestaurantEmpty />

  return (
    <div className="mt-4 space-y-4">
      {listItems}
      <RestaurantListFooter
        totalPages={pagination.totalPages}
        pagination={pagination}
        isMobile={isMobile}
      />
    </div>
  )
}
