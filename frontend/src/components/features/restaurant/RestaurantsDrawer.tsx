'use client'

import type { PageInfo } from '~/types/pagination'
import type { RestaurantListItem } from '~/types/restaurant'
import { motion, useAnimationControls } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/ui/buttons/Button'
import { cn } from '~/utils/cn'
import RestaurantCard from './RestaurantCard'
import RestaurantListHeader from './RestaurantListHeader'
import RestaurantPagination from './RestaurantPagination'

interface RestaurantsDrawerProps {
  restaurants: RestaurantListItem[]
  pagination: PageInfo
  className?: string
}

export default function RestaurantsDrawer({
  restaurants,
  pagination,
  className,
}: RestaurantsDrawerProps) {
  const { currentPage, totalPages, totalCount } = pagination

  const contentRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()

  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0 })

  const calculateConstraints = useCallback(() => {
    if (!contentRef.current)
      return

    const contentHeight = contentRef.current.offsetHeight
    const modalViewHeight = window.innerHeight * 0.35
    const dragDistance = contentHeight - modalViewHeight

    setDragConstraints({
      top: -dragDistance,
      bottom: 0,
    })
  }, [])

  useEffect(() => {
    controls.start({ y: 0 })
  }, [currentPage, controls])

  useEffect(() => {
    const timer = setTimeout(calculateConstraints, 300)

    window.addEventListener('resize', calculateConstraints)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateConstraints)
    }
  }, [calculateConstraints, restaurants])

  return (
    <motion.div
      ref={modalRef}
      drag="y"
      dragConstraints={dragConstraints}
      animate={controls}
      className={cn('absolute bottom-0 z-40 h-drawer w-full', className)}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
    >
      <div className="rounded-t-[10px] border bg-background px-5 py-4" ref={contentRef}>
        <div className="mx-auto mb-2 h-1 w-9 cursor-grabbing rounded-full bg-gray-200" />

        <RestaurantListHeader totalCount={totalCount} />

        <div
          className="mt-4 space-y-4"
          onTouchStart={e => e.stopPropagation()}
          style={{ touchAction: 'pan-y' }}
        >
          {totalCount > 0
            ? (
                <>
                  {restaurants.map(restaurant => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}

                  {totalPages > 1 && (
                    <RestaurantPagination
                      pagination={pagination}
                    />
                  )}

                  <p className="text-center text-xs text-muted-foreground">
                    Powered by
                    {' '}
                    <a href="http://webservice.recruit.co.jp/" className="text-sky-600">
                      ホットペッパーグルメ Webサービス
                    </a>
                  </p>
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
    </motion.div>
  )
}
