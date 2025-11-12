'use client'

import type { MapItems } from '~/types/map'
import dynamic from 'next/dynamic'
import { Skeleton } from '~/components/ui/skeleton'

const MapCanvas = dynamic(() => import('./map-canvas'), {
  ssr: false,
  loading: () => (
    <div className="relative h-mobile-map w-full md:h-desktop-map">
      <Skeleton className="size-full rounded-none" />
    </div>
  ),
})

export default function Map({
  midpoint,
  restaurants,
}: MapItems) {
  return (
    <MapCanvas
      midpoint={midpoint}
      restaurants={restaurants}
    />
  )
}
