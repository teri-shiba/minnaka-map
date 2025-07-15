/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

'use client'
import type { LatLngExpression } from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'

interface Position {
  x: number
  y: number
}

export function useMapCoordinates(latLng: LatLngExpression | null) {
  const map = useMap()
  const [pinPosition, setPinPosition] = useState<Position | null>(null)
  const [mapCenter, setMapCenter] = useState<Position | null>(null)
  const [mapSize, setMapSize] = useState<{ width: number, height: number } | null>(null)

  const positionRef = useRef<Position | null>(null)
  const mapCenterRef = useRef<Position | null>(null)
  const mapSizeRef = useRef<{ width: number, height: number } | null>(null)
  const stableLatLng = useMemo(() => latLng, [latLng])

  const updatePosition = useCallback(() => {
    if (!map)
      return

    const size = map.getSize()
    const newMapSize = { width: size.x, height: size.y }

    if (!mapSizeRef.current || mapSizeRef.current.width !== newMapSize.width || mapSizeRef.current.height !== newMapSize.height) {
      mapSizeRef.current = newMapSize
      setMapSize(newMapSize)
    }

    const center = map.latLngToContainerPoint(map.getCenter())
    const newMapCenter = { x: center.x, y: center.y }

    if (!mapCenterRef.current || mapCenterRef.current.x !== newMapCenter.x || mapCenterRef.current.y !== newMapCenter.y) {
      mapCenterRef.current = newMapCenter
      setMapCenter(newMapCenter)
    }

    if (!stableLatLng) {
      const newPosition = null
      if (positionRef.current !== newPosition) {
        positionRef.current = newPosition
        setPinPosition(newPosition)
      }
      return
    }

    const point = map.latLngToContainerPoint(stableLatLng)
    const newPosition = { x: point.x, y: point.y }

    const prev = positionRef.current
    if (!prev || prev.x !== newPosition.x || prev.y !== newPosition.y) {
      positionRef.current = newPosition
      setPinPosition(newPosition)
    }
  }, [map, stableLatLng])

  useEffect(() => {
    updatePosition()

    map?.on('zoomend moveend move', updatePosition)

    return () => {
      map?.off('zoomend moveend move', updatePosition)
    }
  }, [map, updatePosition])

  return { pinPosition, mapCenter, mapSize }
}
