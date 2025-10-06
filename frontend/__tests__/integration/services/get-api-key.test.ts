import { http, HttpResponse } from 'msw'
import { getApiKey } from '~/services/get-api-key'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))

describe('getApiKey', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-internal-token')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('Map Tiler のとき、HTTP 200 なら API キーを返す', async () => {
    server.use(http.get('*/api_keys/maptiler', async ({ request }) => {
      request.headers.get('X-Internal-Token')
      const apiKey = 'test_api_key'
      return HttpResponse.json({
        success: true,
        data: { apiKey },
      })
    }))

    await expect(getApiKey('maptiler')).resolves.toBe('test_api_key')
  })

  it.each([
    { service: 'hotpepper', endpoint: '*/api_keys/hotpepper' },
    { service: 'maptiler', endpoint: '*/api_keys/maptiler' },
    { service: 'googlemaps', endpoint: '*/api_keys/googlemaps' },
  ] as const)(
    '各サービスのとき、X-Internal-Token ヘッダーを送る（$service）',
    async ({ service, endpoint }) => {
      let seenToken: string | null = null
      server.use(http.get(endpoint, async ({ request }) => {
        seenToken = request.headers.get('X-Internal-Token')
        const apiKey = 'dummy-key'
        return HttpResponse.json({
          success: true,
          data: { apiKey },
        })
      }))
      await getApiKey(service)
      expect(seenToken).toBe('test-internal-token')
    },
  )

  it('Google Maps の API キーが存在しないとき、notFoundMessage を含むエラーを投げる', async () => {
    server.use(http.get('*/api_keys/googlemaps', async () => {
      return HttpResponse.json({}, { status: 404 })
    }))

    await expect(getApiKey('googlemaps'))
      .rejects
      .toThrow('GoogleMaps APIキー取得失敗: APIキーが見つかりません')
  })

  it('サーバーエラーで API キーが取得できないとき、「サーバーエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('*/api_keys/hotpepper', async () => {
      return HttpResponse.json({}, { status: 500 })
    }))

    await expect(getApiKey('hotpepper'))
      .rejects
      .toThrow('HotPepper APIキー取得失敗: サーバーエラーが発生しました')
  })

  it('ネットワークエラーが発生したとき、「ネットワークエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('*/api_keys/maptiler', async () => {
      return HttpResponse.error()
    }))

    await expect(getApiKey('maptiler'))
      .rejects
      .toThrow('MapTiler APIキー取得失敗: ネットワークエラーが発生しました')
  })

  it('設定していないサービスを渡したとき、「未対応のサービスです」のメッセージを投げる', async () => {
    await expect(getApiKey('invalid_service' as any))
      .rejects
      .toThrow('未対応のサービスです: invalid_service')
  })
})
