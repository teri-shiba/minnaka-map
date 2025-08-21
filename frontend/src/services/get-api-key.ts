'use server'

import type { SupportedService } from '~/constants'
import type { ApiResponse } from '~/types/api-response'
import { API_SERVICES } from '~/constants'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'
import { apiFetchPublic, handleApiError } from './api-client'

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = API_SERVICES[service]
  if (!config)
    throw new Error(`未対応のサービスです: ${service}`)

  try {
    const response = await apiFetchPublic<ApiResponse<{ api_key: string }>>(
      config.endpoint,
      {
        extraHeaders: { 'X-Internal-Token': process.env.INTERNAL_API_TOKEN! },
      },
    )

    if (!isApiSuccess(response))
      throw new Error(`${config.serviceName} APIキー取得失敗: ${getApiErrorMessage(response)}`)

    return response.data.api_key
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
