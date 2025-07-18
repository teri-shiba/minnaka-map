import type { RestaurantListItem } from '~/types/restaurant'
import Image from 'next/image'
import Link from 'next/link'
import { LuCalendarX2, LuTramFront } from 'react-icons/lu'
import { Badge } from '~/ui/badges/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/ui/cards/Card'

interface RestaurantCardProps {
  restaurant: RestaurantListItem
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      href={`restaurant/${restaurant.id}`}
      className="group block [@media(max-width:335px)]:flex-col"
    >
      <Card>
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
          <CardTitle className="text-limit-twolines pl-1 text-sm text-sky-600 group-hover:text-primary group-hover:underline md:text-base">
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
    </Link>
  )
}
