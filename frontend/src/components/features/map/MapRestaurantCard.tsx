'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback } from 'react'
import { LuCalendarX2, LuTramFront, LuX } from 'react-icons/lu'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

interface MapRestaurantCardProps {
  restaurant: RestaurantListItem
  onClose: () => void
}

function MapRestaurantCard({ restaurant, onClose }: MapRestaurantCardProps) {
  const {
    id,
    name,
    station,
    imageUrl,
    genreName,
    close,
  } = restaurant

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    },
    [onClose],
  )

  return (
    <Link
      href={`restaurant/${id}`}
      className="block cursor-pointer"
      onClick={e => e.stopPropagation()}
    >
      <Card className="relative w-full flex-row shadow-lg md:flex-col">
        <CardHeader className="relative w-1/3 overflow-hidden p-0 md:w-full">
          <Image
            alt={name}
            src={imageUrl}
            width={223}
            height={168}
            className="aspect-square size-full object-cover md:aspect-3/2"
          />
        </CardHeader>

        <Button
          size="icon"
          variant="ghost"
          aria-label="カードを閉じる"
          className="absolute right-2 top-2 z-50 size-6 rounded-full bg-white/90 md:size-8 md:transition-all md:duration-100 md:ease-linear md:hover:scale-105"
          onClick={handleClose}
        >
          <LuX className="size-4" />
        </Button>

        <CardContent className="relative w-2/3 flex-1 space-y-2 px-3 pb-3 md:w-full">
          <Badge>{genreName}</Badge>
          <CardTitle className="truncate text-sm">{name}</CardTitle>
          <CardDescription>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center truncate">
                <LuTramFront className="mr-1 size-3.5 text-gray-400" />
                {station}
                駅
              </li>
              <li className="flex items-center truncate">
                <LuCalendarX2 className="mr-1 size-3.5 text-gray-400" />
                {close}
              </li>
            </ul>
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

export default memo(MapRestaurantCard)
