import type { SupportedService } from '~/constants'
import type { ApiResponse } from '~/types/api-response'
import { API_SERVICES } from '~/constants'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = API_SERVICES[service]

  if (!config) {
    throw new Error(`未対応のサービスです: ${service}`)
  }

  const response = await apiFetch<ApiResponse<{ api_key: string }>>(
    config.endpoint,
    'GET',
  )

  if (!isApiSuccess(response)) {
    const message = getApiErrorMessage(response)
    logger(new Error(`${config.serviceName} APIキー取得失敗: ${message}`), {
      service: config.serviceName,
      tags: { component: 'getApiKey' },
    })
    throw new Error(`${config.serviceName} APIキー取得失敗: ${message}`)
  }

  const apiKey = response.data.api_key
  if (!apiKey) {
    throw new Error(`${config.serviceName} APIキー取得失敗: api_key が空です`)
  }

  return apiKey
}
