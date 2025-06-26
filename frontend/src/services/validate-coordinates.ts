import type { LatLngExpression } from 'leaflet'
import type { SearchParams } from '~/types/search-params'

// TODO: SearchParams('~/types/search-params') と被っているので、整理する
interface ValidateCoodinatesRequest {
  latitude: string
  longitude: string
  signature?: string
  expires_at?: string
}

export async function validateCoordinates(params: SearchParams): Promise<LatLngExpression | undefined> {
  try {
    const lat = Number.parseFloat(params.lat)
    const lng = Number.parseFloat(params.lng)

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error('無効な位置情報です。')
      return
      // TODO: トップにリダイレクト
    }

    const latStr = lat.toFixed(5)
    const lngStr = lng.toFixed(5)

    const requestBody: ValidateCoodinatesRequest = {
      latitude: latStr,
      longitude: lngStr,
      signature: params.signature,
    }

    if (params.expires_at) {
      requestBody.expires_at = params.expires_at
    }

    const response = await fetch(`${process.env.API_BASE_URL}/validate_coordinates`, {
      next: { revalidate: 3600 },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error('座標の検証に失敗しました。再検索を行ってください。')
      // TODO: トップにリダイレクト
      return
    }

    return [Number.parseFloat(latStr), Number.parseFloat(lngStr)]
  }
  catch (error) {
    console.error('検証エラー:', error)
    // TODO: トップにリダイレクト
  }
}
