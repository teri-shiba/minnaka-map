'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import type { TokenMap } from '~/types/token'
import { useMemo } from 'react'
import RestaurantCard from './restaurant-card'
import RestaurantEmpty from './restaurant-empty'
import RestaurantListFooter from './restaurant-list-footer'

interface Props {
  restaurants: RestaurantListItem[]
  totalCount: number
  pagination: PageInfo
  tokenMap?: TokenMap
  isMobile: boolean
}

const EMPTY_TOKEN_MAP: TokenMap = {}

export default function RestaurantListBody({
  restaurants,
  totalCount,
  pagination,
  tokenMap = EMPTY_TOKEN_MAP,
  isMobile,
}: Props) {
  const listItems = useMemo(() => {
    return restaurants.map(restaurant => (
      <RestaurantCard
        key={restaurant.id}
        restaurant={restaurant}
        tokenInfo={tokenMap[restaurant.id]}
      />
    ))
  }, [restaurants, tokenMap])

  if (totalCount <= 0)
    return <RestaurantEmpty />

  return (
    <div className="flex flex-col gap-4">
      {listItems}
      <RestaurantListFooter
        totalPages={pagination.totalPages}
        pagination={pagination}
        isMobile={isMobile}
      />
    </div>
  )
}
