import type { RestaurantListItem } from '~/types/restaurant'
import { http, HttpResponse } from 'msw'
import { FAVORITE_GROUPS_PER_PAGE, FAVORITES_FIRST_PAGE } from '~/constants'
import { addToFavorites, checkFavoriteStatus, getFavorites, getFavoritesWithDetailsPaginated, removeFromFavorites } from '~/services/favorite-action'
import { fetchRestaurantsByIds } from '~/services/fetch-restaurants-by-ids'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
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

describe('getFavorites', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('HTTP 200 success: true のとき、グループ配列を返す', async () => {
    const group = [
      {
        searchHistory: { id: 1, keyword: '居酒屋', createdAt: '2025-01-01T00:00:00Z' },
        favorites: [{ id: 10, searchHistoryId: 1, hotpepperId: 'J004421997' }],
      },
    ]

    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        if (!url.search)
          return HttpResponse.json({ success: true, data: group })

        // 想定外ルートは落とさない -> ??
        return HttpResponse.json({ success: true, data: [] })
      }),
    )

    const result = await getFavorites()

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data).toEqual(group)
  })

  it('HTTP 200 success: false のとき、失敗とAPI由来メッセージを返す', async () => {
    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        if (!url.search)
          return HttpResponse.json({ success: false, error: { message: '取得失敗' } })

        return HttpResponse.json({ success: true, data: [] })
      }),
    )

    const result = await getFavorites()

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toBe('取得失敗')
  })

  it('ネットワークエラーのとき、既定メッセージで失敗を返す', async () => {
    server.use(
      http.get('*/favorites', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await getFavorites()

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toBe('ネットワークエラーが発生しました')
  })
})

describe('getFavoritesWithDetailsPaginated', () => {
  beforeEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })

  it('成功したとき、レストラン詳細を突合し、meta を保ったまま返す', async () => {
    const pageMeta = { currentPage: 2, totalGroup: 3, hasMore: true }
    const group = [
      {
        searchHistory: { id: 1, keyword: '居酒屋', createdAt: '2025-01-01T00:00:00Z' },
        favorites: [
          { id: 20, searchHistoryId: 2, hotpepperId: 'J004421997' },
          { id: 21, searchHistoryId: 2, hotpepperId: 'J001246910' },
        ],
      },
    ]

    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.has('page'))
          return HttpResponse.json({ success: true, data: group, meta: pageMeta })

        return HttpResponse.json({ success: true, data: [] })
      }),
    )

    vi.mocked(fetchRestaurantsByIds).mockResolvedValue({
      success: true,
      data: [
        makeRestaurant('J004421997'),
        makeRestaurant('J001246910'),
      ],
    })

    const result = await getFavoritesWithDetailsPaginated(2, 10)

    expect(result.success).toBe(true)
    expect(result.meta).toEqual(pageMeta)
    expect(result.data[0].favorites.map(f => f.restaurant.id)).toEqual(['J004421997', 'J001246910'])
  })

  it('success: false のとき、空配列とAPI由来メッセージを返す', async () => {
    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.has('page'))
          return HttpResponse.json({ success: false, error: { message: 'ページ取得失敗' } })

        return HttpResponse.json({ success: true, data: [] })
      }),
    )

    const result = await getFavoritesWithDetailsPaginated(3, 5)

    expect(result.success).toBe(false)
    expect(result.data).toEqual([])
    expect(result.meta).toEqual({ currentPage: 3, totalGroups: 0, hasMore: false })
    expect(result.message).toBe('ページ取得失敗')
  })

  it('引数未指定のとき、規定の page/limit が使われる', async () => {
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

    await getFavoritesWithDetailsPaginated()

    expect(seenPage).toBe(String(FAVORITES_FIRST_PAGE))
    expect(seenLimit).toBe(String(FAVORITE_GROUPS_PER_PAGE))
  })

  it('ネットワークエラーのとき、空配列・既定 meta・既定メッセージで失敗を返す', async () => {
    server.use(
      http.get('*/favorites', async ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.has('page'))
          return HttpResponse.error()
        return HttpResponse.json({ success: true, data: [] })
      }),
    )

    const result = await getFavoritesWithDetailsPaginated(1, 2)

    expect(result.success).toBe(false)
    expect(result.data).toEqual([])
    expect(result.meta).toEqual({ currentPage: 1, totalGroups: 0, hasMore: false })
    expect(result.message).toBe('ネットワークエラーが発生しました')
  })
})

describe('checkFavoriteStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('success: true のとき、isFavorite と favoriteId を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.json({
          success: true,
          data: { isFavorite: true, favoriteId: 30 },
        })
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.isFavorite).toBe(true)
    expect(result.favoriteId).toBe(30)
    expect(result.message).toBeUndefined()
  })

  it('success: false のとき、isFavorite: false と API 由来メッセージを返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.json({
          success: false,
          error: { message: '確認失敗' },
        })
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.isFavorite).toBe(false)
    expect(result.favoriteId).toBeNull()
    expect(result.message).toBe('確認失敗')
  })

  it('ネットワークエラーのとき、既定メッセージで失敗を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '31')

    expect(result.isFavorite).toBe(false)
    expect(result.favoriteId).toBeNull()
    expect(result.message).toBe('予期しないエラーが発生しました')
  })
})

describe('addToFavorites', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('success: true のとき、favoriteId を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({
          success: true,
          data: { id: 101 },
        })
      }),
    )

    const result = await addToFavorites('J001246910', 5)

    expect(result.success).toBe(true)
    expect(result.favoriteId).toBe(101)
  })

  it('success: false のとき、API 由来メッセージを返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({
          success: false,
          error: { message: '追加失敗' },
        })
      }),
    )

    const result = await addToFavorites('J001246910', 5)

    expect(result.success).toBe(false)
    expect(result.message).toBe('追加失敗')
  })

  it('ネットワークエラーのとき、既定メッセージで失敗を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await addToFavorites('J001246910', 5)

    expect(result.success).toBe(false)
    expect(result.message).toBe('ネットワークエラーが発生しました')
  })
})

describe('removeFromFavorites', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('success: true のとき、成功を返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.json({ success: true })
      }),
    )

    const result = await removeFromFavorites(101)

    expect(result.success).toBe(true)
  })

  it('success: false のとき、API 由来メッセージを返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.json({
          success: false,
          error: { message: '削除失敗' },
        })
      }),
    )

    const result = await removeFromFavorites(101)

    expect(result.success).toBe(false)
    expect(result.message).toBe('削除失敗')
  })

  it('ネットワークエラーのとき、既定メッセージで失敗を返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await removeFromFavorites(101)

    expect(result.success).toBe(false)
    expect(result.message).toBe('お気に入りの削除に失敗しました')
  })
})
