'use server'

export type SupportedService = 'hotpepper' | 'maptiler'

const SERVICE_CONFIG = {
  hotpepper: {
    endpoint: '/hotpepper/api_key',
    serviceName: 'HotPepper',
  },
  maptiler: {
    endpoint: '/maptiler/api_key',
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

    if (!data.api_key) {
      throw new Error(`${config.serviceName} APIキーがレスポンスに含まれていません`)
    }

    return data.api_key
  }
  catch (error) {
    console.error(`${config.serviceName} APIキー取得エラー:`, error)

    throw error instanceof Error
      ? error
      : new Error(`${config.serviceName} APIキー取得で予期しないエラーが発生しました`)
  }
}
