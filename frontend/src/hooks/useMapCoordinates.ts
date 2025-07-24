'use client'
import type { LatLngExpression } from 'leaflet'
import type { MapData, MapSize, Position } from '~/types/map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { throttle } from '~/utils/throttle'

export function useMapCoordinates(
  latLng: LatLngExpression | null,
  onChange: (data: MapData) => void,
): MapData {
  const map = useMap()
  const [pinPosition, setPinPosition] = useState<Position | null>(null)
  const [mapCenter, setMapCenter] = useState<Position | null>(null)
  const [mapSize, setMapSize] = useState<MapSize | null>(null)

  const updatePosition = useCallback(() => {
    const size = map.getSize()
    const newMapSize: MapSize = { width: size.x, height: size.y }

    setMapSize((prev) => {
      if (!prev || prev.width !== newMapSize.width || prev.height !== newMapSize.height) {
        return newMapSize
      }
      return prev
    })

    const center = map.latLngToContainerPoint(map.getCenter())
    const newMapCenter: Position = { x: center.x, y: center.y }

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
      const newPosition: Position = { x: point.x, y: point.y }
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

  useEffect(() => {
    onChange({ pinPosition, mapCenter, mapSize })
  }, [onChange, pinPosition, mapCenter, mapSize])

  return { pinPosition, mapCenter, mapSize }
}
