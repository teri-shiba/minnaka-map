'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import type { TokenInfo } from '~/types/token'
import Image from 'next/image'
import Link from 'next/link'
import { LuCalendarX2, LuTramFront } from 'react-icons/lu'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '~/components/ui/card'
import { cn } from '~/utils/cn'
import FavoriteButton from './favorite-button'

interface RestaurantCardProps {
  restaurant: RestaurantListItem
  tokenInfo?: TokenInfo
  showFavoriteButton?: boolean
  searchHistoryId?: string
  favoriteId?: number
}

export default function RestaurantCard({
  restaurant,
  tokenInfo,
  showFavoriteButton = false,
  searchHistoryId,
  favoriteId,
}: RestaurantCardProps) {
  const { id, name, imageUrl, genreName, station, close } = restaurant

  const fromFavoritePage = Boolean(searchHistoryId && favoriteId !== undefined)

  const href = tokenInfo
    ? `restaurant/${id}?t=${encodeURIComponent(tokenInfo.token)}`
    : fromFavoritePage
      ? `restaurant/${id}/?historyId=${searchHistoryId}`
      : `restaurant/${id}`

  return (
    <div className="relative" role="article" aria-label={name}>
      <Link href={href} className="group block">
        <Card className="flex-row gap-2 [@media(max-width:335px)]:flex-col">
          <div className="relative aspect-square size-32 shrink-0 overflow-hidden rounded-lg [@media(max-width:335px)]:w-full">
            <Image
              alt={name}
              src={imageUrl}
              fill={true}
              sizes="(max-width: 335px) 100vw, 128px"
              className="object-cover"
            />
          </div>
          <CardContent className="relative min-w-0 space-y-2 py-0">
            <Badge>{genreName}</Badge>
            <CardTitle className={cn(
              'line-clamp-2 pl-1 text-sm text-sky-600 group-hover:text-primary group-hover:underline md:text-base',
              showFavoriteButton && 'pr-12 [@media(max-width:335px)]:pr-0',
            )}
            >
              {name}
            </CardTitle>
            <CardDescription className="pl-1">
              <ul className="space-y-1 text-xs md:text-sm">
                <li className="truncate">
                  <LuTramFront className="mb-0.5 mr-1 inline-block size-3.5 text-gray-400" />
                  {station}
                  駅
                </li>
                <li className="truncate">
                  <LuCalendarX2 className="mb-0.5 mr-1 inline-block size-3.5 text-gray-400" />
                  {close}
                </li>
              </ul>
            </CardDescription>
          </CardContent>
        </Card>
      </Link>

      {showFavoriteButton && (
        <div
          className="absolute right-0 top-0 [@media(max-width:335px)]:right-1 [@media(max-width:335px)]:top-1"
          onClick={e => e.preventDefault()}
        >
          <FavoriteButton
            hotpepperId={id}
            initialIsFavorite={fromFavoritePage}
            initialFavoriteId={favoriteId ?? null}
            token={tokenInfo?.token}
            initialHistoryId={tokenInfo?.searchHistoryId.toString() || searchHistoryId}
            compact={true}
          />
        </div>
      )}
    </div>
  )
}
