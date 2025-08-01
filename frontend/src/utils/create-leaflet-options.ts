import type { LatLngExpression, MapOptions } from 'leaflet'
import L from 'leaflet'

export function createLeafletOptions(
  userLocation: LatLngExpression,
  isMobile: boolean = false,
): MapOptions {
  const latlng = L.latLng(userLocation)

  const radiusMeters = 3000
  const boundaryOffset = {
    lat: radiusMeters / 111000,
    lng: radiusMeters / (111000 * Math.cos((latlng.lat * Math.PI) / 180)),
  }

  return {
    zoom: isMobile ? 14 : 15,
    minZoom: 14,
    maxZoom: 18,
    zoomSnap: 1,
    zoomDelta: 1,

    scrollWheelZoom: 'center',
    wheelDebounceTime: isMobile ? 100 : 500,
    wheelPxPerZoomLevel: isMobile ? 200 : 60,
    doubleClickZoom: false,
    tapTolerance: 15,

    touchZoom: isMobile ? true : 'center',
    bounceAtZoomLimits: false,

    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,

    inertia: true,
    inertiaDeceleration: isMobile ? 3000 : 2000,
    inertiaMaxSpeed: isMobile ? 800 : 1000,
    easeLinearity: 0.5,

    preferCanvas: true,
    zoomControl: false,

    maxBounds: [
      [latlng.lat - boundaryOffset.lat, latlng.lng - boundaryOffset.lng],
      [latlng.lat + boundaryOffset.lat, latlng.lng + boundaryOffset.lng],
    ],
    maxBoundsViscosity: 1,
  }
}
