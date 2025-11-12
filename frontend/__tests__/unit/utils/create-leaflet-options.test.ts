import type { LatLng, LatLngExpression } from 'leaflet'
import { createLeafletOptions } from '~/utils/create-leaflet-options'

function fakeLatLng(expression: LatLngExpression): LatLng {
  if (Array.isArray(expression)) {
    const [lat, lng] = expression
    return { lat, lng } as unknown as LatLng
  }

  return expression as unknown as LatLng
}

describe('createLeafletOptions', () => {
  const RADIUS_METERS = 3000
  const METERS_PER_DEG_LAT = 111_000
  const DEG_TO_RAD = Math.PI / 180

  it('デスクトップのとき、必要なオプションを生成できる', () => {
    const userLat = 35
    const userLng = 139
    const userLocation: [number, number] = [userLat, userLng]
    const latOffset = RADIUS_METERS / METERS_PER_DEG_LAT
    const lngOffset = RADIUS_METERS / (METERS_PER_DEG_LAT * Math.cos(userLat * DEG_TO_RAD))

    const opts = createLeafletOptions(userLocation, false, { latLng: fakeLatLng })

    // ZOOM
    expect(opts.zoom).toBe(17)
    expect(opts.minZoom).toBe(13)
    expect(opts.maxZoom).toBe(20)
    expect(opts.zoomSnap).toBe(1)
    expect(opts.zoomDelta).toBe(1)

    // SCROLL
    expect(opts.scrollWheelZoom).toBe('center')
    expect(opts.wheelDebounceTime).toBe(500)
    expect(opts.wheelPxPerZoomLevel).toBe(60)
    expect(opts.doubleClickZoom).toBe(false)
    expect(opts.tapTolerance).toBe(15)

    // TOUCH / INERTIA
    expect(opts.touchZoom).toBe('center')
    expect(opts.bounceAtZoomLimits).toBe(false)
    expect(opts.inertia).toBe(true)
    expect(opts.inertiaDeceleration).toBe(2000)
    expect(opts.inertiaMaxSpeed).toBe(1000)
    expect(opts.easeLinearity).toBe(0.5)

    // RENDER / UI
    expect(opts.preferCanvas).toBe(true)
    expect(opts.zoomControl).toBe(false)

    // ANIMATION
    expect(opts.fadeAnimation).toBe(false)
    expect(opts.zoomAnimation).toBe(false)
    expect(opts.markerZoomAnimation).toBe(false)

    // BOUNDARY
    expect(Array.isArray(opts.maxBounds)).toBe(true)

    const [[minLat, minLng], [maxLat, maxLng]] = opts.maxBounds as [[number, number], [number, number]]
    expect(minLat).toBeCloseTo(userLat - latOffset, 8)
    expect(minLng).toBeCloseTo(userLng - lngOffset, 8)
    expect(maxLat).toBeCloseTo(userLat + latOffset, 8)
    expect(maxLng).toBeCloseTo(userLng + lngOffset, 8)

    expect(opts.maxBoundsViscosity).toBe(1)
  })

  it('モバイルのとき、必要なオプションが生成できる (差分のみ検証)', () => {
    const userLocation: [number, number] = [35, 139]
    const opts = createLeafletOptions(userLocation, true, { latLng: fakeLatLng })

    // ZOOM
    expect(opts.zoom).toBe(15)

    // SCROLL
    expect(opts.wheelDebounceTime).toBe(100)
    expect(opts.wheelPxPerZoomLevel).toBe(200)

    // TOUCH / INERTIA
    expect(opts.touchZoom).toBe(true)
    expect(opts.inertiaDeceleration).toBe(3000)
    expect(opts.inertiaMaxSpeed).toBe(800)
  })
})
