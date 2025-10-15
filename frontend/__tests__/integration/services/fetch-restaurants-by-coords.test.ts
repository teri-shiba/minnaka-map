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
    vi.stubEnv('NEXT_PUBLIC_HOTPEPPER_API_BASE_URL', baseURL)
    lastHotPepperUrl = null

    server.use(
      http.get('*/api_keys/hotpepper', async () => {
        return HttpResponse.json({
          success: true,
          data: { apiKey: 'API_KEY' },
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
      latitude: 35.0,
      longitude: 139.0,
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
    expect(params.get('range')).toBe('5')
    expect(params.get('start')).toBe(String(start))
    expect(params.get('count')).toBe(String(itemsPerPage))
    expect(params.get('format')).toBe('json')
  })

  it('HotPepper が HTTP ステータス 429 のとき、RATE_LIMIT とメッセージで失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({ message: 'rate' }, { status: 429 })
      }),
    )

    const result = await fetchRestaurantsByCoords({
      latitude: 35.0,
      longitude: 139.0,
      page: 1,
      itemsPerPage: 5,
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('RATE_LIMIT')
      expect(result.message).toBe('HotPepper API のレート制限に達しました')
    }
  })

  it('HotPepper が HTTP ステータス 500 のとき、SERVER_ERROR のメッセージで失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({ message: 'server-error' }, { status: 500 })
      }),
    )

    const result = await fetchRestaurantsByCoords({
      latitude: 35.0,
      longitude: 139.0,
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('SERVER_ERROR')
      expect(result.message).toBe('HotPepper API サーバーエラーが発生しました')
    }
  })

  it('HotPepper が HTTP ステータス 404 などのとき、REQUEST_FAILED と既定メッセージで失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({ message: 'not-found' }, { status: 404 })
      }),
    )

    const result = await fetchRestaurantsByCoords({
      latitude: 35.0,
      longitude: 139.0,
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('REQUEST_FAILED')
      expect(result.message).toBe('店舗情報の取得に失敗しました')
    }
  })

  it('ネットワーク例外のとき、NETWORK と既定メッセージで失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await fetchRestaurantsByCoords({
      latitude: 35.0,
      longitude: 139.0,
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('NETWORK')
      expect(result.message).toBe('ネットワークエラーが発生しました')
    }
  })
})
