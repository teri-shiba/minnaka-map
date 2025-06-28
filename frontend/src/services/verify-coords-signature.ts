import type { LatLngExpression } from 'leaflet'
import { redirect } from 'next/navigation'

interface ValidateCoordsRequest {
  latitude: string
  longitude: string
  signature: string
  expires_at?: number
}

export async function verifyCoordsSignature(opts: {
  latitude: number
  longitude: number
  signature: string
  expires_at?: number
}): Promise<LatLngExpression | undefined> {
  try {
    const latStr = opts.latitude.toFixed(5)
    const lngStr = opts.longitude.toFixed(5)

    const body: ValidateCoordsRequest = {
      latitude: latStr,
      longitude: lngStr,
      signature: opts.signature,
      ...(opts.expires_at ? { expires_at: opts.expires_at } : {}),
    }

    const response = await fetch(`${process.env.API_BASE_URL}/validate_coordinates`, {
      next: { revalidate: 3600 },
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      redirect('/?error=validation_failed')
    }

    return [opts.latitude, opts.longitude]
  }
  catch (error) {
    redirect('/?error=validation_error')
  }
}
