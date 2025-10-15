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
