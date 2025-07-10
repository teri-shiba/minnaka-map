'use client'

import type { MapItems } from '~/types/map'
import dynamic from 'next/dynamic'
import LoadingIcon from '~/public/figure_loading_circle.svg'
import { Skeleton } from '~/ui/skeleton/Skeleton'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="relative h-mobile-map w-full md:h-desktop-map">
      <Skeleton className="size-full" />
      <LoadingIcon
        aria-label="ローディング中"
        width={40}
        height={40}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  ),
})

export default function MapClient({
  apiKey,
  midpoint,
  restaurants,
}: MapItems) {
  return (
    <Map
      apiKey={apiKey}
      midpoint={midpoint}
      restaurants={restaurants}
    />
  )
}
