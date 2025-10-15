'use server'

import type { SupportedService } from '~/constants'
import type { ServiceResult } from '~/types/service-result'
import { API_SERVICES } from '~/constants'
import { HttpError } from '~/lib/http-error'
import { logger } from '~/lib/logger'
import { getErrorInfo } from '~/utils/get-error-info'

export async function getApiKey(
  service: SupportedService,
): Promise<ServiceResult<string>> {
  try {
    const config = API_SERVICES[service]
    if (!config) {
      return {
        success: false,
        message: `未対応のサービスです: ${service}`,
        cause: 'REQUEST_FAILED',
      }
    }

    const url = new URL(`/api/v1/${config.endpoint}`, process.env.API_BASE_URL)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Internal-Token': process.env.INTERNAL_API_TOKEN!,
    })

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-cache',
    })

    if (!response.ok)
      throw new HttpError(response.status, `${config.serviceName} APIキー取得失敗`)

    const json = await response.json()

    return {
      success: true,
      data: String(json.data.apiKey),
    }
  }
  catch (error) {
    logger(error, {
      component: 'getApiKey',
      extra: { service },
    })

    const errorInfo = getErrorInfo({
      error,
      notFoundErrorMessage: 'APIキーが見つかりません',
    })

    return {
      success: false,
      message: errorInfo.message,
      cause: errorInfo.cause,
    }
  }
}
