'use client'

import type { MapItems } from '~/types/map'
import dynamic from 'next/dynamic'
import Loading from '~/public/figure_loading_circle.svg'
import { Skeleton } from '../skeleton/Skeleton'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[calc(60vh-4rem)] w-full md:h-[calc(100vh-4rem)]">
      <Skeleton className="size-full" />
      <Loading
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
