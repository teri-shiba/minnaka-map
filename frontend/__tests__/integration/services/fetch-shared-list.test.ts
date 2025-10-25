import { http, HttpResponse } from 'msw'
import { fetchSharedList } from '~/services/fetch-shared-list'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

describe('fetchSharedList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('シェアリスト取得に成功したとき、title と favorites を返す', async () => {
    server.use(
      http.get('*/api/v1/shared_favorite_lists/:uuid', async () => {
        return HttpResponse.json({
          success: true,
          data: {
            title: '東京・神田',
            created_at: '2025-01-01T00:00:00Z',
            search_history: {
              id: 1,
              station_names: ['東京', '神田'],
            },
            favorites: [
              { id: 10, hotpepper_id: 'J001246910' },
              { id: 11, hotpepper_id: 'J004421997' },
            ],
          },
        })
      }),
    )

    const result = await fetchSharedList('abc-123')

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        title: '東京・神田',
        createdAt: '2025-01-01T00:00:00Z',
        searchHistory: {
          id: 1,
          stationNames: ['東京', '神田'],
        },
        favorites: [
          { id: 10, hotpepperId: 'J001246910' },
          { id: 11, hotpepperId: 'J004421997' },
        ],
      })
    }
  })

  it('存在しない UUID のとき、NOT_FOUND で失敗を返す', async () => {
    server.use(
      http.get('*/api/v1/shared_favorite_lists/:uuid', async () => {
        return HttpResponse.json({}, { status: 404 })
      }),
    )

    const result = await fetchSharedList('not-found')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('シェアリストが見つかりません')
      expect(result.cause).toBe('NOT_FOUND')
    }
  })

  it('API が 400 エラーのとき、REQUEST_FAILED で失敗を返す', async () => {
    server.use(
      http.get('*/api/v1/shared_favorite_lists/:uuid', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await fetchSharedList('invalid')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('この店舗リストは存在しないか、削除されています')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('ネットワークエラーのとき、NETWORK を返す', async () => {
    server.use(
      http.get('*/api/v1/shared_favorite_lists/:uuid', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await fetchSharedList('abc-123')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })
})
