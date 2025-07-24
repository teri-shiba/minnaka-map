'use client'
import type { LatLngExpression } from 'leaflet'
import type { MapData } from '~/types/map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { throttle } from '~/utils/throttle'

const THROTTLE_MS = 16

export function useMapCoordinates(
  latLng: LatLngExpression | null,
  onChange: (data: MapData) => void,
): void {
  const map = useMap()
  const [data, setData] = useState<MapData>({
    pinPosition: null,
    mapCenter: null,
    mapSize: null,
  })

  const updatePosition = useCallback(() => {
    const size = map.getSize()
    const centerPoint = map.latLngToContainerPoint(map.getCenter())
    const pinPoint = latLng
      ? map.latLngToContainerPoint(latLng)
      : null

    setData({
      mapSize: { width: size.x, height: size.y },
      mapCenter: { x: centerPoint.x, y: centerPoint.y },
      pinPosition: pinPoint ? { x: pinPoint.x, y: pinPoint.y } : null,
    })
  }, [map, latLng])

  const throttledUpdate = useMemo(
    () => throttle(updatePosition, THROTTLE_MS),
    [updatePosition],
  )

  useMapEvents({
    load: updatePosition,
    zoomend: updatePosition,
    moveend: updatePosition,
    move: throttledUpdate,
  })

  useEffect(() => {
    const id = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(id)
  }, [updatePosition, latLng])

  useEffect(() => {
    onChange(data)
  }, [onChange, data])
}
