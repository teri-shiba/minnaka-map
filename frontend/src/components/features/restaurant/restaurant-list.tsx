'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { useEffect, useRef } from 'react'
import useDrawerController from '~/hooks/useDrawerController'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import useScrollToTopOnChange from '~/hooks/useScrollToTopOnChange'
import RestaurantDrawerContainer from './restaurant-drawer-container'
import RestaurantListBody from './restaurant-list-body'
import RestaurantListHeader from './restaurant-list-header'
import RestaurantSidebarContainer from './restaurant-sidebar-container'

interface Props {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
}

export default function RestaurantList({ restaurants, pagination }: Props) {
  const { currentPage, totalCount } = pagination

  const isDesktop = useMediaQuery('(min-width: 768px)')

  // SP: スクロール対象の参照とドロワー制御
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { contentRef, dragConstraints, controls, resetPosition } = useDrawerController(!isDesktop)

  const headingId = 'restaurant-list-heading'

  // PC: ページ変更時の先頭スクロール
  const listRef = isDesktop ? scrollContainerRef : contentRef
  useScrollToTopOnChange(listRef, currentPage)

  // SP: ページ変更時のドロワー位置リセット
  useEffect(() => {
    if (isDesktop)
      return

    resetPosition()
  }, [currentPage, isDesktop, resetPosition])

  return (
    <>
      {/* PC */}
      <RestaurantSidebarContainer
        containerRef={scrollContainerRef}
        className="hidden md:block"
      >
        <RestaurantListHeader totalCount={totalCount} />
        <RestaurantListBody
          restaurants={restaurants}
          totalCount={totalCount}
          pagination={pagination}
          isMobile={false}
        />
      </RestaurantSidebarContainer>
      )

      {/* SP */}
      <RestaurantDrawerContainer
        contentRef={contentRef}
        controls={controls}
        dragConstraints={dragConstraints}
        className="block md:hidden"
      >
        <RestaurantListHeader id={headingId} totalCount={totalCount} />
        <RestaurantListBody
          restaurants={restaurants}
          totalCount={totalCount}
          pagination={pagination}
          isMobile={true}
        />
      </RestaurantDrawerContainer>
    </>
  )
}
