import type { RestaurantList } from '~/types/restaurant'
import Image from 'next/image'
import { LuCalendarX2, LuTramFront } from 'react-icons/lu'
import { Badge } from '../badges/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from './Card'

interface RestaurantCardProps {
  restaurant: RestaurantList
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="[@media(max-width:335px)]:flex-col">
      <div className="relative aspect-square size-32 shrink-0 overflow-hidden rounded-lg [@media(max-width:335px)]:w-full">
        <Image
          alt={restaurant.name}
          src={restaurant.imageUrl}
          fill={true}
          sizes="(max-width: 335px) 100vw, 128px"
          className="object-cover"
        />
      </div>
      <CardContent className="relative min-w-0 space-y-2 py-0">
        <Badge>{restaurant.genreName}</Badge>
        <CardTitle className="text-limit-twolines pl-1 text-sm md:text-base">
          {restaurant.name}
        </CardTitle>
        <CardDescription className="pl-1">
          <ul className="space-y-1 text-xs md:text-sm">
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
  )
}
