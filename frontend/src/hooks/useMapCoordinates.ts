'use client'
import type { LatLngExpression } from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMap } from 'react-leaflet'
import { throttle } from '~/utils/throttle'

interface Position {
  x: number
  y: number
}

export function useMapCoordinates(latLng: LatLngExpression | null) {
  const map = useMap()
  const [mapState, setMapState] = useState({
    pinPosition: null as Position | null,
    mapCenter: null as Position | null,
    mapSize: null as { width: number, height: number } | null,
  })

  const stableLatLng = useMemo(() => latLng, [latLng])

  const updatePosition = useCallback(() => {
    if (!map)
      return

    const size = map.getSize()
    const newMapSize = { width: size.x, height: size.y }

    if (
      !mapState.mapSize
      || mapState.mapSize.width !== newMapSize.width
      || mapState.mapSize.height !== newMapSize.height
    ) {
      setMapState(prev => ({ ...prev, mapSize: newMapSize }))
    }

    const center = map.latLngToContainerPoint(map.getCenter())
    const newMapCenter = { x: center.x, y: center.y }

    if (
      !mapState.mapCenter
      || mapState.mapCenter.x !== newMapCenter.x
      || mapState.mapCenter.y !== newMapCenter.y
    ) {
      setMapState(prev => ({ ...prev, mapCenter: newMapCenter }))
    }

    if (!stableLatLng) {
      const newPosition = null
      if (mapState.pinPosition !== newPosition) {
        setMapState(prev => ({ ...prev, pinPosition: newPosition }))
      }
      return
    }

    const point = map.latLngToContainerPoint(stableLatLng)
    const newPosition = { x: point.x, y: point.y }

    const prev = mapState.pinPosition
    if (!prev || prev.x !== newPosition.x || prev.y !== newPosition.y) {
      setMapState(prev => ({ ...prev, pinPosition: newPosition }))
    }
  }, [map, mapState, stableLatLng])

  const throttledUpdatePosition = useCallback(
    throttle(updatePosition, 16),
    [updatePosition],
  )

  useEffect(() => {
    updatePosition()
  }, [updatePosition, stableLatLng])

  useEffect(() => {
    if (!map)
      return

    map.on('zoomend moveend', updatePosition)
    map.on('move', throttledUpdatePosition)

    return () => {
      map.off('zoomend moveend', updatePosition)
      map.off('move', throttledUpdatePosition)
    }
  }, [map, updatePosition, throttledUpdatePosition])

  return {
    pinPosition: mapState.pinPosition,
    mapCenter: mapState.mapCenter,
    mapSize: mapState.mapSize,
  }
}
