import type { RestaurantListItem } from '~/types/restaurant'
import { http, HttpResponse } from 'msw'
import { fetchRestaurantsByIds } from '~/services/fetch-restaurants-by-ids'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { FAVORITE_GROUPS_PER_PAGE, FAVORITES_FIRST_PAGE, getFavoriteGroups } from '~/services/get-favorite-groups'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))
vi.mock('~/services/fetch-restaurants-by-ids', () => ({
  fetchRestaurantsByIds: vi.fn(),
}))

// 店舗のダミーデータ
function makeRestaurant(id: string): RestaurantListItem {
  return {
    id,
    name: `テスト店舗 ${id}`,
    station: 'テスト駅',
    lat: 35.0,
    lng: 139.0,
    genreName: '居酒屋',
    genreCode: 'G001',
    imageUrl: `https://img.example.com/${id}_l.jpg`,
    close: '年末年始休',
  }
}

describe('getFavoriteGroups', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  it('成功したとき、レストラン詳細を結合してグループと pagination を返す', async () => {
    const pageMeta = { currentPage: 2, totalGroup: 3, hasMore: true }
    const groupData = [
      {
        search_history: { id: 1, station_names: ['東京', '神田'] },
        favorites: [
          { id: 20, searchHistoryId: 2, hotpepperId: 'J004421997' },
          { id: 21, searchHistoryId: 2, hotpepperId: 'J001246910' },
        ],
      },
    ]

    server.use(
      http.get('*/favorites', async () => {
        return HttpResponse.json({
          success: true,
          data: groupData,
          meta: pageMeta,
        })
      }),
    )

    vi.mocked(fetchRestaurantsByIds).mockResolvedValue({
      success: true,
      data: [
        makeRestaurant('J004421997'),
        makeRestaurant('J001246910'),
      ],
    })

    const result = await getFavoriteGroups(2)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.groups).toHaveLength(1)
      expect(result.data.groups[0].favorites).toHaveLength(2)
      expect(result.data.groups[0].favorites.map(
        fav => fav.restaurant.id,
      )).toEqual(['J004421997', 'J001246910'])
      expect(result.data.pagination).toEqual(pageMeta)
    }
  })

  it('API が 400 エラーのとき、REQUEST_FAILED で失敗を返す', async () => {
    server.use(
      http.get('*/favorites', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await getFavoriteGroups(1)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入り店舗を取得できませんでした')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('引数未指定のとき、デフォルトの page が使われる', async () => {
    let seenPage: string | null = null
    let seenLimit: string | null = null

    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        seenPage = url.searchParams.get('page')
        seenLimit = url.searchParams.get('limit')

        return HttpResponse.json({
          success: true,
          data: [],
          meta: {
            currentPage: Number(seenPage),
            totalGroups: 0,
            hasMore: false,
          },
        })
      }),
    )

    vi.mocked(fetchRestaurantsByIds).mockResolvedValue({
      success: true,
      data: [],
    })

    await getFavoriteGroups()

    expect(seenPage).toBe(String(FAVORITES_FIRST_PAGE))
    expect(seenLimit).toBe(String(FAVORITE_GROUPS_PER_PAGE))
  })

  it('ネットワークエラーのとき、NETWORK で失敗を返す', async () => {
    server.use(
      http.get('*/favorites', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await getFavoriteGroups(1)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    vi.mocked(getAuthFromCookie).mockResolvedValueOnce(null)

    const result = await getFavoriteGroups(1)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
