'use server'

import type { SupportedService } from '~/constants'
import type { ApiResponse } from '~/types/api-response'
import { API_SERVICES } from '~/constants'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { handleApiError } from '~/utils/error-map'
import { apiFetch } from './api-client'

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = API_SERVICES[service]
  if (!config)
    throw new Error(`未対応のサービスです: ${service}`)

  try {
    const response = await apiFetch<ApiResponse<{ apiKey: string }>>(
      config.endpoint,
      {
        extraHeaders: { 'X-Internal-Token': process.env.INTERNAL_API_TOKEN! },
      },
    )

    if (!isApiSuccess(response))
      throw new Error(`${config.serviceName} APIキー取得失敗: ${getApiErrorMessage(response)}`)

    return response.data.apiKey
  }
  catch (error) {
    const failure = handleApiError(error, {
      component: 'getApiKey',
      defaultMessage: `${config.serviceName} APIキー取得に失敗しました`,
      notFoundMessage: `${config.serviceName} APIキーが見つかりません`,
      extraContext: { service },
    })

    throw new Error(`${config.serviceName} APIキー取得失敗: ${failure.message}`)
  }
}
