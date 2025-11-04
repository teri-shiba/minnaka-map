'use server'

import type { LatLngExpression } from 'leaflet'
import type { ServiceResult } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { getErrorInfo } from '~/utils/get-error-info'

interface VerifyCoordsOptions {
  lat: number
  lng: number
  sig: string
  exp: string | number
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

    if (typeof opts.exp === 'number' && opts.exp <= nowSec) {
      return {
        success: false,
        message: 'リンクの有効期限が切れました。もう一度検索してください。',
        cause: 'EXPIRED',
      }
    }

    // キャッシュ利用
    const remainingSec = typeof opts.exp === 'number'
      ? Math.max(0, opts.exp - nowSec)
      : 60

    const secondsToLive = Math.min(remainingSec, 300)
    const cache: RequestCache = secondsToLive > 0 ? 'force-cache' : 'no-cache'
    const revalidateConfig: NextFetchRequestConfig | undefined
      = secondsToLive > 0 ? { revalidate: secondsToLive } : undefined

    // リクエスト
    const url = new URL('/api/v1/midpoint/validate', process.env.API_BASE_URL)
    url.search = new URLSearchParams({
      lat: opts.lat.toFixed(5),
      lng: opts.lng.toFixed(5),
      sig: opts.sig,
      exp: opts.exp.toString(),
    }).toString()

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
      data: [opts.lat, opts.lng],
    }
  }
  catch (error) {
    logger(error, {
      component: 'verifyCoordsSignature',
      extra: {
        lat: opts.lat,
        lng: opts.lng,
        sig: opts.sig,
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
