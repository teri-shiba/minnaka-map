import { http, HttpResponse } from 'msw'
import { fetchRestaurantsByCoords } from '~/services/fetch-restaurants-by-coords'
import { buildHotPepperResults, buildHotPepperShop } from '../helpers/hotpepper-fixtures'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

describe('fetchRestaurantsByCoords', () => {
  const baseURL = 'https://hotpepper.test.local'
  let lastHotPepperUrl: URL | null = null

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-internal-token')
    vi.stubEnv('HOTPEPPER_API_BASE_URL', baseURL)
    lastHotPepperUrl = null

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

  it('HTTP ステータスが 200 のとき、ページング情報と items を返す', async () => {
    const page = 3
    const itemsPerPage = 10
    const start = (page - 1) * itemsPerPage + 1
    const total = 123
    const shops = Array.from({ length: itemsPerPage }, (_, i) => buildHotPepperShop(String(1000 + i)))

    server.use(
      http.get('*/gourmet/v1*', async ({ request }) => {
        lastHotPepperUrl = new URL(request.url)
        return HttpResponse.json(buildHotPepperResults(shops, total))
      }),
    )

    const result = await fetchRestaurantsByCoords({
      lat: 35.0,
      lng: 139.0,
      genre: 'G001',
      page,
      itemsPerPage,
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.items).toHaveLength(itemsPerPage)
      expect(result.data.pagination).toEqual({
        currentPage: page,
        totalPages: Math.ceil(total / itemsPerPage),
        totalCount: total,
        itemsPerPage,
      })
      expect(result.data.hasMore).toBe(page < Math.ceil(total / itemsPerPage))
    }

    expect(lastHotPepperUrl).not.toBeNull()
    const params = lastHotPepperUrl!.searchParams
    expect(params.get('key')).toBe('API_KEY')
    expect(params.get('lat')).toBe('35')
    expect(params.get('lng')).toBe('139')
    expect(params.get('genre')).toBe('G001')
    expect(params.get('range')).toBe('3')
    expect(params.get('start')).toBe(String(start))
    expect(params.get('count')).toBe(String(itemsPerPage))
    expect(params.get('format')).toBe('json')
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

    const result = await fetchRestaurantsByCoords({
      lat: 35.0,
      lng: 139.0,
      page: 1,
      itemsPerPage: 5,
    })

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

    const result = await fetchRestaurantsByCoords({
      lat: 35.0,
      lng: 139.0,
    })

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

    const result = await fetchRestaurantsByCoords({
      lat: 35.0,
      lng: 139.0,
    })

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

    const result = await fetchRestaurantsByCoords({
      lat: 35.0,
      lng: 139.0,
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('NETWORK')
      expect(result.message).toBe('ネットワークエラーが発生しました')
    }
  })
})
