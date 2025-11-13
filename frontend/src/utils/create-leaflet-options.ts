import type { LatLng, LatLngExpression, MapOptions } from 'leaflet'
import L from 'leaflet'

const RADIUS_METERS = 1000
const METERS_PER_DEG_LAT = 111_000
const DEG_TO_RAD = Math.PI / 180

interface Deps { latLng: (expression: LatLngExpression) => LatLng }

function computeBoundaryOffset(
  latDeg: number,
  radiusMeters: number,
) {
  const latOffset = radiusMeters / METERS_PER_DEG_LAT
  const lngOffset = radiusMeters / (METERS_PER_DEG_LAT * Math.cos(latDeg * DEG_TO_RAD))
  return { lat: latOffset, lng: lngOffset }
}

export function createLeafletOptions(
  userLocation: LatLngExpression,
  isMobile: boolean = false,
  deps: Deps = { latLng: L.latLng },
): MapOptions {
  const latLng = deps.latLng(userLocation)
  const boundaryOffset = computeBoundaryOffset(latLng.lat, RADIUS_METERS)

  return {
    // ZOOM
    zoom: isMobile ? 15 : 17,
    minZoom: 13,
    maxZoom: 20,
    zoomSnap: 1,
    zoomDelta: 1,

    // SCROLL
    scrollWheelZoom: 'center',
    wheelDebounceTime: isMobile ? 100 : 500,
    wheelPxPerZoomLevel: isMobile ? 200 : 60,
    doubleClickZoom: false,
    tapTolerance: 15,

    // TOUCH / INERTIA
    touchZoom: isMobile ? true : 'center',
    bounceAtZoomLimits: false,
    inertia: true,
    inertiaDeceleration: isMobile ? 3000 : 2000,
    inertiaMaxSpeed: isMobile ? 800 : 1000,
    easeLinearity: 0.5,

    // RENDER / UI
    preferCanvas: true,
    zoomControl: false,

    // ANIMATION
    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,

    // BOUNDARY
    maxBounds: [
      [latLng.lat - boundaryOffset.lat, latLng.lng - boundaryOffset.lng],
      [latLng.lat + boundaryOffset.lat, latLng.lng + boundaryOffset.lng],
    ],
    maxBoundsViscosity: 1,
  }
}
