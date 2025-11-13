import { http, HttpResponse } from 'msw'
import { getApiKey } from '~/services/get-api-key'
import { server } from '../setup/msw.server'

vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

describe('getApiKey', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-internal-token')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('Map Tiler のとき、HTTP 200 なら API キーを返す', async () => {
    server.use(http.get('*/api_keys/maptiler', async () => {
      return HttpResponse.json({
        success: true,
        data: { api_key: 'test_api_key' },
      })
    }))

    const result = await getApiKey('maptiler')

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data).toBe('test_api_key')
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
        return HttpResponse.json({
          success: true,
          data: { api_key: 'dummy-key' },
        })
      }))

      const result = await getApiKey(service)

      expect(seenToken).toBe('test-internal-token')
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data).toBe('dummy-key')
    },
  )

  it('Google Maps の API キーが存在しないとき、notFoundMessage を含むエラーを投げる', async () => {
    server.use(http.get('*/api_keys/googlemaps', async () => {
      return HttpResponse.json({}, { status: 404 })
    }))

    const result = await getApiKey('googlemaps')

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('APIキーが見つかりません')
  })

  it('サーバーエラーで API キーが取得できないとき、「サーバーエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('*/api_keys/hotpepper', async () => {
      return HttpResponse.json({}, { status: 500 })
    }))

    const result = await getApiKey('hotpepper')

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('サーバーエラーが発生しました')
  })

  it('ネットワークエラーが発生したとき、「ネットワークエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('*/api_keys/maptiler', async () => {
      return HttpResponse.error()
    }))

    const result = await getApiKey('maptiler')

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('ネットワークエラーが発生しました')
  })

  it('設定していないサービスを渡したとき、「未対応のサービスです」のメッセージを投げる', async () => {
    const result = await getApiKey('invalid_service' as any)

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('未対応のサービスです')
  })
})
