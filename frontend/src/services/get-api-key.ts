// import { logger } from '~/lib/logger'

export type SupportedService = 'hotpepper' | 'maptiler'

const SERVICE_CONFIG = {
  hotpepper: {
    endpoint: '/api_keys/hotpepper',
    serviceName: 'HotPepper',
  },
  maptiler: {
    endpoint: '/api_keys/maptiler',
    serviceName: 'MapTiler',
  },
} as const

export async function getApiKey(service: SupportedService): Promise<string> {
  const config = SERVICE_CONFIG[service]

  if (!config) {
    throw new Error(`未対応のサービスです: ${service}`)
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}${config.endpoint}`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`${config.serviceName} APIキー取得失敗: HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.api_key
  }
  catch (error) {
    console.error(error)
    // logger(error, {
    //   service: config.serviceName,
    //   tags: { component: 'getApiKey' },
    // })

    throw error instanceof Error
      ? error
      : new Error(`${config.serviceName} APIキー取得で予期しないエラーが発生しました`)
  }
}
