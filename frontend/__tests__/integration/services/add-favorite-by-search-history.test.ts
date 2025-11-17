import { http, HttpResponse } from 'msw'
import { addFavoriteBySearchHistory } from '~/services/add-favorite-by-search-history'
import { setupAuthMock, setupUnauthorized } from '../helpers/auth-mock'
import { server } from '../setup/msw.server'

describe('addFavoriteBySearchHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setupAuthMock()
  })

  it('お気に入り追加に成功したとき、success: true と favoriteId と hotpepperId を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/favorites/by_search_history', async () => {
        return HttpResponse.json({
          success: true,
          data: { id: 101, hotpepper_id: 'J001246910' },
        })
      }),
    )

    const result = await addFavoriteBySearchHistory('J001246910', 'SH99')

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.favoriteId).toBe(101)
      expect(result.data.hotpepperId).toBe('J001246910')
    }
  })

  it('API が 400 エラーのとき、success: false を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/favorites/by_search_history', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await addFavoriteBySearchHistory('J001246910', 'SH99')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('検索結果にない店舗のとき、422 エラーを返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/favorites/by_search_history', async () => {
        return HttpResponse.json(
          { error: 'この店舗は検索結果に含まれていません' },
          { status: 400 },
        )
      }),
    )

    const result = await addFavoriteBySearchHistory('99999', 'SH99')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('存在しない検索履歴IDのとき、404 エラーを返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/favorites/by_search_history', async () => {
        return HttpResponse.json(
          { error: '検索履歴が見つかりません' },
          { status: 404 },
        )
      }),
    )

    const result = await addFavoriteBySearchHistory('J001246910', '99999')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('NOT_FOUND')
    }
  })

  it('ネットワークエラーのとき、success: false と NETWORK を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/favorites/by_search_history', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await addFavoriteBySearchHistory('J001246910', 'SH99')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    setupUnauthorized()

    const result = await addFavoriteBySearchHistory('J001246910', 'SH99')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
