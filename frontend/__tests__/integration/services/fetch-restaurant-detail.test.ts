import { http, HttpResponse } from 'msw'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'
import { buildHotPepperResults, buildHotPepperShop } from '../helpers/hotpepper-fixtures'
import { server } from '../setup/msw.server'

vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

describe('fetchRestaurantDetail', () => {
  const baseURL = 'https://hotpepper.test.local'

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-internal-token')
    vi.stubEnv('HOTPEPPER_API_BASE_URL', baseURL)

    server.use(
      http.get('*/api_keys/hotpepper', async () => {
        return HttpResponse.json({
          success: true,
          data: { api_key: 'API_KEY' },
        })
      }),
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllEnvs()
  })

  it('店舗IDが存在するとき、店舗の詳細情報を返す', async () => {
    const shopId = 'J004421997'
    const shop = buildHotPepperShop(shopId)

    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json(buildHotPepperResults([shop], 1))
      }),
    )

    const result = await fetchRestaurantDetail(shopId)

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data.id).toBe(shopId)
  })

  it('店舗が見つからないとき、NOT_FOUND で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json(buildHotPepperResults([], 0))
      }),
    )

    const result = await fetchRestaurantDetail('INVALID_ID')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('NOT_FOUND')
      expect(result.message).toBe('店舗が見つかりませんでした')
    }
  })

  it('サーバーエラー (code: 1000) のとき、SERVER_ERROR で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({
          results: {
            api_version: '1.30',
            error: [{ code: 1000, message: 'サーバー障害エラー' }],
          },
        }, { status: 200 })
      }),
    )

    const result = await fetchRestaurantDetail('J004421997')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('SERVER_ERROR')
      expect(result.message).toBe('サーバーエラーが発生しました')
    }
  })

  it('APIキー認証エラー (code: 2000)のとき、SERVER_ERROR で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({
          results: {
            api_version: '1.30',
            error: [{ code: 2000, message: '認証エラー' }],
          },
        }, { status: 200 })
      }),
    )

    const result = await fetchRestaurantDetail('J004421997')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('SERVER_ERROR')
      expect(result.message).toBe('サーバーエラーが発生しました')
    }
  })

  it('パラメータ不正エラー (code: 3000)のとき、REQUEST_FAILED で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({
          results: {
            api_version: '1.30',
            error: [{ code: 3000, message: 'パラメータ不正エラー' }],
          },
        }, { status: 200 })
      }),
    )

    const result = await fetchRestaurantDetail('J004421997')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('REQUEST_FAILED')
      expect(result.message).toBe('店舗情報を取得できませんでした')
    }
  })

  it('ネットワークエラーのとき、NETWORK で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await fetchRestaurantDetail('J004421997')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('NETWORK')
      expect(result.message).toBe('ネットワークエラーが発生しました')
    }
  })
})
