'use client'
import type { LatLngExpression } from 'leaflet'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const Map = dynamic(() => import('~/components/ui/map/Map'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})

export default function Result() {
  const params = useSearchParams()
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null)
  const baseApiURL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    const validateCoordinates = async () => {
      const latParam = params.get('lat')
      const lngParam = params.get('lng')
      const signature = params.get('signature')

      if (!latParam || !lngParam || !signature) {
        toast.error('検索パラメータが不足しています。再度計算を行ってください。')
        router.push('/')
        return
      }

      const lat = Number.parseFloat(latParam)
      const lng = Number.parseFloat(lngParam)

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        toast.error('無効な位置情報です。再度検索を行ってください。')
        router.push('/')
        return
      }

      try {
        const response = await fetch(`${baseApiURL}/validate_coordinates`, {
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
          const errorData = await response.json()
          toast.error(errorData.message || '座標の検証に失敗しました。再検索を行ってください。')
          router.push('/')
          return
        }

        setUserLocation([lat, lng])
      }
      catch (e) {
        console.error('検証エラー:', e)
        toast.error('検証中にエラーが発生しました。再度お試しください。')
        router.push('/')
      }
    }

    validateCoordinates()
  }, [params, router, baseApiURL])

  return (
    <>
      <main className="size-full">
        {userLocation && <Map userLocation={userLocation} />}
      </main>
    </>
  )
}
