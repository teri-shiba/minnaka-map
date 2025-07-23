'use client'
import type { LatLngExpression } from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { throttle } from '~/utils/throttle'

interface Position {
  x: number
  y: number
}

export function useMapCoordinates(latLng: LatLngExpression | null) {
  const map = useMap()
  const [pinPosition, setPinPosition] = useState<Position | null>(null)
  const [mapCenter, setMapCenter] = useState<Position | null>(null)
  const [mapSize, setMapSize] = useState<{ width: number, height: number } | null>(null)

  const updatePosition = useCallback(() => {
    const size = map.getSize()
    const newMapSize = { width: size.x, height: size.y }

    setMapSize((prev) => {
      if (!prev || prev.width !== newMapSize.width || prev.height !== newMapSize.height) {
        return newMapSize
      }
      return prev
    })

    const center = map.latLngToContainerPoint(map.getCenter())
    const newMapCenter = { x: center.x, y: center.y }

    setMapCenter((prev) => {
      if (!prev || prev.x !== newMapCenter.x || prev.y !== newMapCenter.y) {
        return newMapCenter
      }
      return prev
    })

    if (!latLng) {
      setPinPosition(prev => (prev !== null ? null : prev))
    }
    else {
      const point = map.latLngToContainerPoint(latLng)
      const newPosition = { x: point.x, y: point.y }
      setPinPosition((prev) => {
        if (!prev || prev.x !== newPosition.x || prev.y !== newPosition.y) {
          return newPosition
        }
        return prev
      })
    }
  }, [map, latLng])

  const throttledUpdate = useMemo(
    () => throttle(updatePosition, 16),
    [updatePosition],
  )

  useMapEvents(
    {
      load: updatePosition,
      zoomend: updatePosition,
      moveend: updatePosition,
      move: throttledUpdate,
    },
  )

  useEffect(() => {
    const rafId = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(rafId)
  }, [updatePosition, latLng])

  return { pinPosition, mapCenter, mapSize }
}
