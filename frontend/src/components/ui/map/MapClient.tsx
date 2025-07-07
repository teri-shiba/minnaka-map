'use client'

import type { MapItems } from '~/types/map'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })

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
