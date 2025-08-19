import type { SupportedService } from '~/constants'
import type { ApiResponse } from '~/types/api-response'
import { API_SERVICES } from '~/constants'
import { logger } from '~/lib/logger'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetch } from './api-client'

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = API_SERVICES[service]
  if (!config)
    throw new Error(`未対応のサービスです: ${service}`)

  try {
    const response = await apiFetch<ApiResponse<{ api_key: string }>>(
      config.endpoint,
      'GET',
    )

    if (!isApiSuccess(response))
      throw new Error(`${config.serviceName} APIキー取得失敗: ${getApiErrorMessage(response)}`)

    return response.data.api_key
  }
  catch (error) {
    logger(error, { tags: { component: 'getApiKey' }, service: config.serviceName })

    if (error instanceof TypeError)
      throw new Error(`${config.serviceName} APIキー取得失敗: ネットワークエラー`)

    throw error
  }
}
