import type { LatLngExpression } from 'leaflet'
import type { SearchParams } from '~/types/search-params'

export async function validateCoordinates(params: SearchParams): Promise<LatLngExpression | undefined> {
  try {
    const { lat: latParam, lng: lngParam, signature } = params

    if (!latParam || !lngParam || !signature) {
      console.error('検索パラメーターが不足しています')
      return
      // TODO: トップにリダイレクト
    }

    const lat = Number.parseFloat(latParam)
    const lng = Number.parseFloat(lngParam)

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error('無効な位置情報です。')
      return
      // TODO: トップにリダイレクト
    }

    const response = await fetch(`${process.env.API_BASE_URL}/validate_coordinates`, {
      next: { revalidate: 3600 },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        signature,
      }),
    })

    if (!response.ok) {
      console.error('座標の検証に失敗しました。再検索を行ってください。')
      // TODO: トップにリダイレクト
      return
    }
    return [lat, lng]
  }
  catch (error) {
    console.error('検証エラー:', error)
    // TODO: トップにリダイレクト
  }
}
