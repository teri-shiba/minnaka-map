import type { LatLngExpression, MapOptions } from 'leaflet'
import L from 'leaflet'

export function createLeafletOptions(userLocation: LatLngExpression): MapOptions {
  const latlng = L.latLng(userLocation)
  return {
    zoom: 18,
    minZoom: 17,
    maxZoom: 19,
    zoomSnap: 1,
    zoomDelta: 1,

    scrollWheelZoom: 'center',
    wheelDebounceTime: 500,

    touchZoom: 'center',
    tapTolerance: 15,
    bounceAtZoomLimits: false,
    doubleClickZoom: false,
    maxBounds: [
      [latlng.lat - 0.001, latlng.lng - 0.001],
      [latlng.lat + 0.001, latlng.lng + 0.001],
    ],
    maxBoundsViscosity: 0.8,

    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,

    inertia: true,
    inertiaDeceleration: 2000,
    inertiaMaxSpeed: 1000,
    easeLinearity: 0.5,

    preferCanvas: true,
    zoomControl: false,
  }
}
