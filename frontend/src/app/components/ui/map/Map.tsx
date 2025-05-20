'use client'

import type { MapProps } from '~/app/types/map'
import { useEffect, useState } from 'react'
import { MapContainer, ZoomControl } from 'react-leaflet'
import MapTailerLayer from './layers/MapTailerLayer'
import UserLocationMarker from './markers/UserLocationMarker'
import 'leaflet/dist/leaflet.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export default function Map({
  userLocation,
  className = '',
}: MapProps) {
  const baseApiURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [mapApiKey, setMapApiKey] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`${baseApiURL}/map_tiler/api_key`)
        const data = await response.json()
        setMapApiKey(data.api_key)
      }
      catch (e) {
        console.error('APIキーの取得に失敗:', e)
      }
    }

    fetchApiKey()
  }, [baseApiURL])

  return (
    <div className={`relative h-screen w-full ${className}`}>
      <MapContainer
        center={userLocation}
        zoom={18}
        minZoom={18}
        maxZoom={20}
        zoomControl={false}
        className="absolute size-full"

      >
        {mapApiKey && <MapTailerLayer apiKey={mapApiKey} />}
        <ZoomControl position="bottomright" />
        <UserLocationMarker position={userLocation} />
      </MapContainer>
    </div>
  )
}
