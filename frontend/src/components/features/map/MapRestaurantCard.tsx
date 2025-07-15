'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import Image from 'next/image'
import Link from 'next/link'
import { LuCalendarX2, LuTramFront, LuX } from 'react-icons/lu'
import { Badge } from '~/components/ui/badges/badge'
import { Button } from '~/components/ui/buttons/Button'
import { Card, CardContent, CardDescription, CardTitle } from '~/components/ui/cards/Card'

interface MapRestaurantCardProps {
  restaurant: RestaurantListItem
  onClose: () => void
}

export default function MapRestaurantCard({ restaurant, onClose }: MapRestaurantCardProps) {
  return (
    <Link
      href={`restaurant/${restaurant.id}`}
      className="block"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Card
        className="relative w-full flex-row md:flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {onClose && (
          <Button
            size="icon"
            aria-label="カードを閉じる"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="absolute right-2 top-2 z-50 size-6 rounded-full bg-white/90 transition-all duration-200 ease-linear hover:scale-105 hover:bg-white md:size-8"
          >
            <LuX className="block size-4 text-foreground" />
          </Button>
        )}

        <div className="relative w-1/3 overflow-hidden md:w-full">
          <Image
            alt={restaurant.name}
            src={restaurant.imageUrl}
            width={223}
            height={168}
            className="aspect-square size-full object-cover md:aspect-3/2"
          />
        </div>
        <CardContent className="relative w-2/3 flex-1 space-y-2 px-3 pb-3 md:w-full">
          <Badge>{restaurant.genreName}</Badge>
          <CardTitle className="text-limit-oneline text-sm">
            {restaurant.name}
          </CardTitle>
          <CardDescription>
            <ul className="space-y-1 text-xs">
              <li className="text-limit-oneline">
                <LuTramFront className="mb-0.5 mr-1 inline-block size-3.5 text-gray-400" />
                {restaurant.station}
                駅
              </li>
              <li className="text-limit-oneline">
                <LuCalendarX2 className="mb-0.5 mr-1 inline-block size-3.5 text-gray-400" />
                {restaurant.close}
              </li>
            </ul>
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
