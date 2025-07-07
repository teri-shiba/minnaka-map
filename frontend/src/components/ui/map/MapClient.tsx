'use client'

import type { MapItems } from '~/types/map'
import dynamic from 'next/dynamic'
import { Skeleton } from '../skeleton/Skeleton'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[calc(60vh-4rem)] w-full md:h-[calc(100vh-4rem)]" />,
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
