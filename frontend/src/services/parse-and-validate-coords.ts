import type { SearchParams } from '~/types/search-params'
import { redirect } from 'next/navigation'
import { JAPAN_BOUNDS } from '~/constants'

export function parseAndValidateCoordinates(params: SearchParams): { lat: number, lng: number } {
  const lat = Number.parseFloat(params.lat)
  const lng = Number.parseFloat(params.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    redirect('/?error=invalid_coordinates')
  }

  if (
    lat < JAPAN_BOUNDS.LAT_MIN
    || lat > JAPAN_BOUNDS.LAT_MAX
    || lng < JAPAN_BOUNDS.LNG_MIN
    || lng > JAPAN_BOUNDS.LNG_MAX
  ) {
    redirect('/?error=outside_japan')
  }

  return { lat, lng }
}
