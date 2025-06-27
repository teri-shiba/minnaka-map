import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'

const JAPAN_COODINATE_BOUNDS = {
  LAT_MIN: 26.0,
  LAT_MAX: 45.5,
  LNG_MIN: 123.0,
  LNG_MAX: 146.0,
} as const

export function parseAndValidateCoordinates(params: SearchParams): { lat: number, lng: number } {
  const lat = Number.parseFloat(params.lat)
  const lng = Number.parseFloat(params.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    redirect('/?error=invalid_coordinates')
  }

  if (
    lat < JAPAN_COODINATE_BOUNDS.LAT_MIN
    || lat > JAPAN_COODINATE_BOUNDS.LAT_MAX
    || lng < JAPAN_COODINATE_BOUNDS.LNG_MIN
    || lng > JAPAN_COODINATE_BOUNDS.LNG_MAX
  ) {
    redirect('/?error=outside_japan')
  }

  return { lat, lng }
}
