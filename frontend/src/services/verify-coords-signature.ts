'use server'

import type { LatLngExpression } from 'leaflet'
import type { ServiceCause, ServiceResult } from '~/types/service-result'
import { API_ENDPOINTS } from '~/constants'
import { logger } from '~/lib/logger'
import { ApiError, apiFetchPublic } from './api-client'

interface VerifyCoordsOptions {
  latitude: number
  longitude: number
  signature: string
  expires_at?: number
}

interface ValidateResponse {
  valid: boolean
}

export async function verifyCoordsSignature(
  opts: VerifyCoordsOptions,
): Promise<ServiceResult<LatLngExpression>> {
  try {
    const nowSec = Math.floor(Date.now() / 1000)

    if (typeof opts.expires_at === 'number' && opts.expires_at <= nowSec)
      return { success: false, message: 'リンクの有効期限が切れました。もう一度検索してください。', cause: 'EXPIRED' }

    const remainingSec = typeof opts.expires_at === 'number'
      ? Math.max(0, opts.expires_at - nowSec)
      : 60

    const secondsToLive = Math.min(remainingSec, 300)
    const cache: RequestCache = secondsToLive > 0 ? 'force-cache' : 'no-cache'
    const revalidateConfig: NextFetchRequestConfig | undefined
      = secondsToLive > 0 ? { revalidate: secondsToLive } : undefined

    const result = await apiFetchPublic<ValidateResponse>(API_ENDPOINTS.VALIDATE_COORDINATES, {
      params: {
        latitude: opts.latitude.toFixed(5),
        longitude: opts.longitude.toFixed(5),
        signature: opts.signature,
        ...(opts.expires_at ? { expires_at: opts.expires_at } : {}),
      },
      cache,
      next: revalidateConfig,
    })

    if (!result.valid)
      return { success: false, message: '座標の検証に失敗しました', cause: 'REQUEST_FAILED' }

    return { success: true, data: [opts.latitude, opts.longitude] }
  }
  catch (error) {
    if (error instanceof ApiError) {
      const status = error.status
      const cause: ServiceCause
      = status === 400
        ? 'INVALID_SIGNATURE'
        : status >= 500
          ? 'SERVER_ERROR'
          : 'REQUEST_FAILED'

      logger(error, { tags: { component: 'verifyCoordsSignature', status } })
      return { success: false, message: '座標の検証に失敗しました', cause }
    }

    logger(error, { tags: { component: 'verifyCoordsSignature' } })
    return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }
  }
}
