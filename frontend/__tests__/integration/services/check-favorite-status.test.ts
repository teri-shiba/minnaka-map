import { http, HttpResponse } from 'msw'
import { checkFavoriteStatus } from '~/services/check-favorite-status'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

describe('checkFavoriteStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  it('お気に入り登録済みのとき、success: true と isFavorite: true を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.json({
          success: true,
          data: { is_favorite: true, favorite_id: 30 },
        })
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        isFavorite: true,
        favoriteId: 30,
      })
    }
  })

  it('お気に入り未登録のとき、success: true のとき、isFavorite: false を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.json({
          success: true,
          data: { is_favorite: false, favorite_id: null },
        })
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        isFavorite: false,
        favoriteId: null,
      })
    }
  })

  it('API が 400 エラーのとき、success: false を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入り登録情報を取得できませんでした')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('ネットワークエラーのとき、success: false と NETWORK を返す', async () => {
    server.use(
      http.get('*/favorites/status', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await checkFavoriteStatus('J001246910', '31')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    vi.mocked(getAuthFromCookie).mockResolvedValueOnce(null)

    const result = await checkFavoriteStatus('J001246910', '3')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
