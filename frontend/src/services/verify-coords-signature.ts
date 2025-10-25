'use server'

import type { LatLngExpression } from 'leaflet'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { getErrorInfo } from '~/utils/get-error-info'

interface VerifyCoordsOptions {
  latitude: number
  longitude: number
  signature?: string
  expires_at?: number
}

interface ValidateResponse {
  valid: boolean
}

export async function verifyCoordsSignature(
  opts: VerifyCoordsOptions,
): Promise<ServiceResult<LatLngExpression>> {
  try {
    // 有効期限チェック
    const nowSec = Math.floor(Date.now() / 1000)

    if (
      typeof opts.expires_at === 'number'
      && opts.expires_at <= nowSec
    ) {
      return {
        success: false,
        message: 'リンクの有効期限が切れました。もう一度検索してください。',
        cause: 'EXPIRED',
      }
    }

    // キャッシュ利用
    const remainingSec = typeof opts.expires_at === 'number'
      ? Math.max(0, opts.expires_at - nowSec)
      : 60

    const secondsToLive = Math.min(remainingSec, 300)
    const cache: RequestCache = secondsToLive > 0 ? 'force-cache' : 'no-cache'
    const revalidateConfig: NextFetchRequestConfig | undefined
      = secondsToLive > 0 ? { revalidate: secondsToLive } : undefined

    // リクエスト
    const url = new URL('/api/v1/midpoint/validate', process.env.API_BASE_URL)
    url.searchParams.set('latitude', opts.latitude.toFixed(5))
    url.searchParams.set('longitude', opts.longitude.toFixed(5))

    if (opts.signature)
      url.searchParams.set('signature', opts.signature)

    if (opts.expires_at)
      url.searchParams.set('expiresAt', opts.expires_at.toString())

    const headers = new Headers({
      Accept: 'application/json',
    })

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache,
      next: revalidateConfig,
    })

    if (!response.ok) {
      throw new HttpError(response.status, '座標の検証に失敗しました')
    }

    const result = await response.json() as ValidateResponse

    if (!result.valid) {
      return {
        success: false,
        message: '座標の検証に失敗しました',
        cause: 'REQUEST_FAILED',
      }
    }

    return {
      success: true,
      data: [opts.latitude, opts.longitude],
    }
  }
  catch (error) {
    logger(error, {
      component: 'verifyCoordsSignature',
      extra: {
        latitude: opts.latitude,
        longitude: opts.longitude,
        hasSignature: !!opts.signature,
      },
    })

    const errorInfo = await getErrorInfo({ error })

    // 400エラーのみ署名検証失敗として扱う
    if (error instanceof HttpError && error.status === 400) {
      return {
        success: false,
        message: '座標の検証に失敗しました',
        cause: 'INVALID_SIGNATURE',
      }
    }

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
