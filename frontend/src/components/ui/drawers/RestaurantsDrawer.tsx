'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LuAlignLeft } from 'react-icons/lu'
import { cn } from '~/utils/cn'
import { Button } from '../buttons/Button'
import RestaurantCard from '../cards/RestaurantCard'
import RestaurantPagination from '../pagination/RestaurantPagination'

interface RestaurantsDrawerProps {
  restaurants: RestaurantListItem[]
  currentPage: number
  totalPages: number
  totalCount: number
  className?: string
}

export default function RestaurantsDrawer({
  restaurants,
  currentPage,
  totalPages,
  totalCount,
  className,
}: RestaurantsDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()

  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0 })

  useEffect(() => {
    controls.start({ y: 0 })
  }, [currentPage, controls])

  useEffect(() => {
    const calculateConstraints = () => {
      if (!contentRef.current)
        return

      const contentHeight = contentRef.current.offsetHeight
      const modalViewHeight = window.innerHeight * 0.4
      const dragDistance = contentHeight - modalViewHeight

      setDragConstraints({
        top: -dragDistance,
        bottom: 0,
      })
    }

    const timer = setTimeout(calculateConstraints, 100)

    window.addEventListener('resize', calculateConstraints)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateConstraints)
    }
  }, [])

  return (
    <motion.div
      ref={modalRef}
      drag="y"
      dragConstraints={dragConstraints}
      animate={controls}
      className={cn('absolute bottom-0 z-40 h-[40vh] w-full', className)}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
    >
      <div className="rounded-t-[10px] border bg-background px-5 py-4" ref={contentRef}>
        <div className="mx-auto mb-2 h-1 w-9 cursor-grabbing rounded-full bg-gray-200" />

        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-base">
            検索結果 全
            {' '}
            {totalCount}
            {' '}
            件
          </h2>
          <p className="text-xs">
            <LuAlignLeft className="mb-0.5 mr-1 inline size-3.5" />
            中心地点から近い順
          </p>
        </div>

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
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}

        <p
          className="pt-4 text-center text-xs text-muted-foreground"
        >
          Powered by
          {' '}
          <a
            href="http://webservice.recruit.co.jp/"
            className="text-sky-500"
          >
            ホットペッパーグルメ Webサービス
          </a>
        </p>
        <p className="pt-1 text-center text-xs text-muted-foreground">
          画像提供：ホットペッパー グルメ
        </p>
      </div>
    </motion.div>
  )
}
