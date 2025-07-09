'use client'

import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface ApiKeyProps {
  apiKey: string | null
}

export default function MapTailerLayer({ apiKey }: ApiKeyProps) {
  const map = useMap()

  useEffect(() => {
    if (!apiKey)
      return

    const styleId = process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID

    if (!styleId) {
      Sentry.captureException('NEXT_PUBLIC_MAPTILER_STYLE_ID is not configured')
      return
    }

    const styleUrl = `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`

    const layer = new MaptilerLayer({
      apiKey,
      style: styleUrl,
      // @ts-expect-error: TODO remove this once maptiler-sdk-js v4.1.0 (or later) fixes extractCustomLayerStyle warning (see #216)
      space: false,
      halo: false,
    }).addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, apiKey])

  return null
}
