import { http, HttpResponse } from 'msw'
import { fetchRestaurantsByIds } from '~/services/fetch-restaurants-by-ids'
import { buildHotPepperResults, buildHotPepperShop } from '../helpers/hotpepper-fixtures'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

describe('fetchRestaurantsByIds', () => {
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

  it('リクエスト店舗の数が20件を超えたとき、チャンク分割して取得し、要求順で返す', async () => {
    // 25件(20 + 5) -> 2チャンクになる
    const requestedIds = Array.from({ length: 25 }, (_, i) => `S${i + 1}`)

    server.use(
      http.get('*/gourmet/v1*', async ({ request }) => {
        const url = new URL(request.url)
        const ids = (url.searchParams.get('id') ?? '').split(',').filter(Boolean)
        const shops = ids.map(id => buildHotPepperShop(id))
        return HttpResponse.json(buildHotPepperResults(shops, ids.length))
      }),
    )

    const restaurantIds = requestedIds as [string, ...string[]]

    const result = await fetchRestaurantsByIds(restaurantIds)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toHaveLength(25)
      const returnedIds = result.data.map(item => item.id)
      expect(returnedIds).toEqual(requestedIds)
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

    const restaurantIds = ['X1'] as [string, ...string[]]

    const result = await fetchRestaurantsByIds(restaurantIds)

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

    const restaurantIds = ['Y1'] as [string, ...string[]]

    const result = await fetchRestaurantsByIds(restaurantIds)

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

    const restaurantIds = ['Z1'] as [string, ...string[]]

    const result = await fetchRestaurantsByIds(restaurantIds)

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

    const restaurantIds = ['A1', 'A2', 'A3'] as [string, ...string[]]

    const result = await fetchRestaurantsByIds(restaurantIds)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('NETWORK')
      expect(result.message).toBe('ネットワークエラーが発生しました')
    }
  })

  it('一部店舗の情報が取得できなかったとき、成功分のみリクエストIDの並びのまま返す', async () => {
    const ids = Array.from({ length: 45 }, (_, i) => `B${i + 1}`) as [string, ...string[]]

    server.use(
      http.get('*/gourmet/v1*', async ({ request }) => {
        const url = new URL(request.url)
        const chunkIds = (url.searchParams.get('id') ?? '').split(',').filter(Boolean)

        if (chunkIds.includes('B21')) {
          return HttpResponse.json({}, { status: 500 })
        }

        const shops = chunkIds.map(id => buildHotPepperShop(id))
        return HttpResponse.json(buildHotPepperResults(shops, chunkIds.length))
      }),
    )

    const restaurantIds = ids
    const result = await fetchRestaurantsByIds(restaurantIds)

    expect(result.success).toBe(true)

    if (result.success) {
      const returnedIds = result.data.map(i => i.id)
      expect(returnedIds).toEqual([
        ...ids.slice(0, 20),
        ...ids.slice(40, 45),
      ])
    }
  })
})
