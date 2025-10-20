'use client'

import type { LatLngExpression } from 'leaflet'
import type { MapData } from '~/types/map'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { throttle } from '~/utils/throttle'

const THROTTLE_MS = 16

interface ExtractLatLngReturn {
  lat: number | null
  lng: number | null
}

function extractLatLng(
  latLng: LatLngExpression | null,
): ExtractLatLngReturn {
  if (!latLng)
    return { lat: null, lng: null }

  if (Array.isArray(latLng))
    return { lat: latLng[0], lng: latLng[1] }

  if ('lat' in latLng && 'lng' in latLng)
    return { lat: latLng.lat as number, lng: latLng.lng as number }

  return { lat: null, lng: null }
}

export function useMapCoordinates(
  latLng: LatLngExpression | null,
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

  // latLng も ref で保持して、常に最新の値を参照できるようにする
  const latLngRef = useRef(latLng)

  useEffect(() => {
    onChangeRef.current = onChange
    latLngRef.current = latLng
  })

  // latLng から lat, lng を抽出（プリミティブ値なので参照の問題がない）
  const { lat, lng } = extractLatLng(latLng)

  // updatePosition: lat, lng が変わった時だけ再実行
  useEffect(() => {
    const updatePosition = () => {
      const size = map.getSize()
      const centerPoint = map.latLngToContainerPoint(map.getCenter())
      const currentLatLng = latLngRef.current
      const markerPoint = currentLatLng
        ? map.latLngToContainerPoint(currentLatLng)
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
    const currentLatLng = latLngRef.current
    const markerPoint = currentLatLng
      ? map.latLngToContainerPoint(currentLatLng)
      : null

    setData({
      mapSize: { width: size.x, height: size.y },
      mapCenter: { x: centerPoint.x, y: centerPoint.y },
      markerPosition: markerPoint ? { x: markerPoint.x, y: markerPoint.y } : null,
    })
  }

  const throttledUpdate = useMemo(
    () => throttle(() => updatePositionRef.current?.(), THROTTLE_MS),
    [],
  )

  useMapEvents({
    load: () => updatePositionRef.current?.(),
    zoomend: () => updatePositionRef.current?.(),
    moveend: () => updatePositionRef.current?.(),
    move: throttledUpdate,
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
