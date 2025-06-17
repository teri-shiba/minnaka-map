'use client'

import type { MapProps } from '~/types/map'
import { useEffect, useState } from 'react'
import { MapContainer, ZoomControl } from 'react-leaflet'
import { createMapOptions } from '~/lib/mapOptions'
import MapTailerLayer from './layers/MapTailerLayer'
import UserLocationMarker from './markers/UserLocationMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  userLocation,
}: MapProps) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [mapApiKey, setMapApiKey] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`${baseURL}/map_tiler/api_key`)
        const data = await response.json()
        setMapApiKey(data.api_key)
      }
      catch (e) {
        console.error('APIキーの取得に失敗:', e)
      }
    }

    fetchApiKey()
  }, [baseURL])

  const mapOptions = createMapOptions(userLocation)

  return (
    <main className="relative size-full flex-1 overflow-hidden md:w-3/5">
      <MapContainer
        center={userLocation}
        {...mapOptions}
        className="absolute size-full"
      >
        {mapApiKey
          && (
            <MapTailerLayer
              apiKey={mapApiKey}
            />
          )}
        <ZoomControl position="bottomright" />
        <UserLocationMarker position={userLocation} />
      </MapContainer>
    </main>
  )
}
