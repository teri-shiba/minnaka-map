'use client'

import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { logger } from '~/lib/logger'
import { getApiKey } from '~/services/get-api-key'

export default function MapTilerLayer() {
  const map = useMap()
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApiKey() {
      const result = await getApiKey('maptiler')
      if (result.success) {
        setApiKey(result.data)
      }
      else {
        const error = new Error('MapTiler API Key 取得失敗')
        logger(error, {
          component: 'MapTilerLayer',
          action: 'fetchApiKey',
        })
      }
    }

    fetchApiKey()
  }, [])

  useEffect(() => {
    if (!apiKey)
      return

    const styleId = process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID

    if (!styleId) {
      Sentry.captureException('NEXT_PUBLIC_MAPTILER_STYLE_ID is not configured')
      return
    }

    const styleUrlObj = new URL(`https://api.maptiler.com/maps/${styleId}/style.json`)
    styleUrlObj.searchParams.set('key', apiKey)
    const styleUrl = styleUrlObj.toString()

    const layer = new MaptilerLayer({
      apiKey,
      style: styleUrl,
    }).addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, apiKey])

  return null
}
