'use client'

import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { useMemo } from 'react'
import { Marker } from 'react-leaflet'

interface PositionProps {
  position: LatLngExpression
}

export default function MidpointMarker({ position }: PositionProps) {
  const icon = useMemo(() => {
    return L.icon({
      iconUrl: '/figure_pin_center.webp',
      iconSize: [35, 45],
      iconAnchor: [17, 45],
      shadowUrl: '/figure_pin_center_shadow.webp',
      shadowSize: [23, 11],
      shadowAnchor: [11, 6],
    })
  }, [])

  return (
    <Marker
      position={position}
      icon={icon}
      zIndexOffset={1000}
    >
    </Marker>
  )
}
