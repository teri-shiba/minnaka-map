'use client'

import type { RestaurantListItem } from '~/types/restaurant'
import type { TokenInfo } from '~/types/token'
import Image from 'next/image'
import Link from 'next/link'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
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
  priority?: boolean
}

export default function RestaurantCard({
  restaurant,
  tokenInfo,
  showFavoriteButton = false,
  searchHistoryId,
  favoriteId,
  priority = false,
}: RestaurantCardProps) {
  const { id, name, imageUrl, genreName, subGenreName, station, close } = restaurant

  const fromFavoritePage = Boolean(searchHistoryId && favoriteId !== undefined)

  const href = tokenInfo
    ? `/restaurant/${id}?t=${encodeURIComponent(tokenInfo.token)}`
    : fromFavoritePage
      ? `/restaurant/${id}?historyId=${searchHistoryId}`
      : `/restaurant/${id}`

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
              quality={60}
              priority={priority}
              className="object-cover"
            />
          </div>
          <CardContent className="relative flex min-w-0 flex-col gap-2 py-0">
            <div className="flex flex-wrap gap-2">
              <Badge>{genreName}</Badge>
              {subGenreName && (
                <Badge className="bg-secondary text-primary">{subGenreName}</Badge>
              )}
            </div>
            <CardTitle className={cn(
              'line-clamp-2 pl-1 text-stone-700 group-hover:underline',
              showFavoriteButton && 'pr-12 [@media(max-width:335px)]:pr-0',
            )}
            >
              <h3 className="text-[15px] leading-normal">{name}</h3>
            </CardTitle>
            <CardDescription className="pl-1">
              <ul className="flex flex-col gap-0.5 text-[13px]">
                <li className="flex items-center gap-1">
                  <LuMapPin className="shrink-0 text-gray-400" />
                  <span className="truncate">
                    {station}
                    駅
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  <LuCalendar className="shrink-0 text-gray-400" />
                  <span className="truncate">
                    定休日:
                    {close}
                  </span>
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
          onKeyDown={e => e.stopPropagation()}
          role="presentation"
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
