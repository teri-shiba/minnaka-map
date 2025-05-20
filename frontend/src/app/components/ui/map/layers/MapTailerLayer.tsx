'use client'

import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface ApiKeyProps {
  apiKey: string | null
  style?: string
}

export default function MapTailerLayer({ apiKey, style = '0196eb8d-3239-7893-a5fa-e5adfc275a77' }: ApiKeyProps) {
  const map = useMap()

  useEffect(() => {
    if (!apiKey)
      return

    const layer = new MaptilerLayer({
      apiKey,
      style,
    }).addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, apiKey, style])

  return null
}
