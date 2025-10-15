import { http, HttpResponse } from 'msw'
import { fetchRestaurants, fetchRestaurantsByIds } from '~/services/fetch-restaurants'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

function buildHotPepperShop(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: `テスト店舗 ${id}`,
    address: '東京都千代田区神田1-1-1',
    lat: 35.123456,
    lng: 139.123456,
    photo: {
      pc: {
        l: `https://img.example.com/${id}_l.jpg`,
        m: `https://img.example.com/${id}_m.jpg`,
        s: `https://img.example.com/${id}_s.jpg`,
      },
    },
    logo_image: `https://img.example.com/${id}_logo.jpg`,
    urls: { pc: `https://example.com/${id}` },
    genre: { code: 'G001', name: '居酒屋', catch: '' },
    open: '11:00～22:00',
    close: '年末年始休',
    budget: '3000円',
    access: '最寄り駅から徒歩5分',
    ...overrides,
  }
}

function buildHotPepperResults(shops: any[], totalAvailable: number) {
  return {
    results: {
      results_available: totalAvailable,
      shop: shops,
    },
  }
}

describe('fetchRestaurants', () => {
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

    const result = await fetchRestaurants({
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

    const result = await fetchRestaurants({
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

    const result = await fetchRestaurants({
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

    const result = await fetchRestaurants({
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

    const result = await fetchRestaurants({
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

describe('fetchRestaurantsByIds', () => {
  const baseURL = 'https://hotpepper.test.local'

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-internal-token')
    vi.stubEnv('NEXT_PUBLIC_HOTPEPPER_API_BASE_URL', baseURL)

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

    const result = await fetchRestaurantsByIds({
      restaurantIds: requestedIds as [string, ...string[]],
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toHaveLength(25)
      const returnedIds = result.data.map(item => item.id)
      expect(returnedIds).toEqual(requestedIds)
    }
  })

  it('全チャンクが HTTP ステータス 429 のとき、RATE_LIMIT で失敗を返す', async () => {
    server.use(
      http.get('*/gourmet/v1*', async () => {
        return HttpResponse.json({}, { status: 429 })
      }),
    )

    const result = await fetchRestaurantsByIds({
      restaurantIds: ['A1', 'A2', 'A3'] as [string, ...string[]],
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('RATE_LIMIT')
      expect(result.message).toBe('HotPepper API のレート制限に達しました')
    }
  })

  it('一部成功・一部失敗のとき、成功分のみ返し、要求順を維持する', async () => {
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

    const result = await fetchRestaurantsByIds({ restaurantIds: ids })

    expect(result.success).toBe(true)

    if (result.success) {
      const returnedIds = result.data.map(i => i.id)
      expect(returnedIds).toEqual([
        ...ids.slice(0, 20),
        ...ids.slice(40, 45),
      ])
    }
  })

  it('offset/limit が適用される（slice 済みだけ問い合わせる）', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `C${i + 1}`) as [string, ...string[]]
    const expectSlice = ids.slice(3, 3 + 4)

    server.use(
      http.get('*/gourmet/v1*', async ({ request }) => {
        const url = new URL(request.url)
        const idsInQuery = (url.searchParams.get('id') ?? '').split(',').filter(Boolean)
        const shops = idsInQuery.map(id => buildHotPepperShop(id))
        return HttpResponse.json(buildHotPepperResults(shops, idsInQuery.length))
      }),
    )

    const result = await fetchRestaurantsByIds({
      restaurantIds: ids,
      offset: 3,
      limit: 4,
    })

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data.map(i => i.id)).toEqual(expectSlice)
  })
})
