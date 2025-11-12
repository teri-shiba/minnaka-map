'use client'

import type { MapData } from '~/types/map'
import { useEffect, useRef, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

export function useMapCoords(
  lat: number | null,
  lng: number | null,
  onChange: (data: MapData) => void,
): void {
  const map = useMap()
  const [data, setData] = useState<MapData>({
    markerPosition: null,
    mapCenter: null,
    mapSize: null,
  })

  // onChange を ref で安定化して無限ループを防ぐ
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // lat, lng が変わった時だけ再実行
  useEffect(() => {
    const updatePosition = () => {
      const size = map.getSize()
      const centerPoint = map.latLngToContainerPoint(map.getCenter())
      const markerPoint = lat !== null && lng !== null
        ? map.latLngToContainerPoint([lat, lng])
        : null

      setData({
        mapSize: { width: size.x, height: size.y },
        mapCenter: { x: centerPoint.x, y: centerPoint.y },
        markerPosition: markerPoint ? { x: markerPoint.x, y: markerPoint.y } : null,
      })
    }

    const id = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(id)
  }, [map, lat, lng])

  // イベントハンドラー用の安定した参照を作成
  const updatePositionRef = useRef<(() => void) | undefined>(undefined)
  updatePositionRef.current = () => {
    const size = map.getSize()
    const centerPoint = map.latLngToContainerPoint(map.getCenter())
    const markerPoint = lat !== null && lng !== null
      ? map.latLngToContainerPoint([lat, lng])
      : null

    setData({
      mapSize: { width: size.x, height: size.y },
      mapCenter: { x: centerPoint.x, y: centerPoint.y },
      markerPosition: markerPoint ? { x: markerPoint.x, y: markerPoint.y } : null,
    })
  }

  useMapEvents({
    load: () => updatePositionRef.current?.(),
    moveend: () => updatePositionRef.current?.(),
  })

  // data が変更されたときのみ onChange を呼ぶ（初期状態はスキップ）
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    onChangeRef.current(data)
  }, [data])
}
