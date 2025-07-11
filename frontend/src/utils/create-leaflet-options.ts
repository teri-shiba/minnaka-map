import type { LatLngExpression, MapOptions } from 'leaflet'
import L from 'leaflet'

export function createLeafletOptions(userLocation: LatLngExpression): MapOptions {
  const latlng = L.latLng(userLocation)

  const radiusMeters = 3000
  const boundaryOffset = {
    lat: radiusMeters / 111000,
    lng: radiusMeters / (111000 * Math.cos((latlng.lat * Math.PI) / 180)),
  }

  return {
    zoom: 15,
    minZoom: 14,
    maxZoom: 18,
    zoomSnap: 1,
    zoomDelta: 1,

    scrollWheelZoom: 'center',
    wheelDebounceTime: 500,
    doubleClickZoom: false,
    tapTolerance: 15,

    touchZoom: 'center',
    bounceAtZoomLimits: false,

    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,

    inertia: true,
    inertiaDeceleration: 2000,
    inertiaMaxSpeed: 1000,
    easeLinearity: 0.5,

    preferCanvas: true,
    zoomControl: false,

    maxBounds: [
      [latlng.lat - boundaryOffset.lat, latlng.lng - boundaryOffset.lng],
      [latlng.lat + boundaryOffset.lat, latlng.lng + boundaryOffset.lng],
    ],
    maxBoundsViscosity: 0.7,
  }
}
