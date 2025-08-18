import type { SupportedService } from '~/constants'
import { API_SERVICES } from '~/constants'
import { logger } from '~/lib/logger'

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = API_SERVICES[service]

  if (!config) {
    throw new Error(`未対応のサービスです: ${service}`)
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}/${config.endpoint}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`${config.serviceName} APIキー取得失敗: HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.api_key
  }
  catch (error) {
    logger(error, {
      service: config.serviceName,
      tags: { component: 'getApiKey' },
    })

    throw error instanceof Error
      ? error
      : new Error(`${config.serviceName} APIキー取得で予期しないエラーが発生しました`)
  }
}
