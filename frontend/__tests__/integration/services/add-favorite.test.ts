import { http, HttpResponse } from 'msw'
import { addFavorite } from '~/services/add-favorite'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

describe('addFavorite', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  it('お気に入り追加に成功したとき、success: true と favoriteId を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({
          success: true,
          data: { id: 101 },
        })
      }),
    )

    const result = await addFavorite('J001246910', 5)

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data.favoriteId).toBe(101)
  })

  it('API が 400 エラーのとき、success: false を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await addFavorite('J001246910', 5)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('ネットワークエラーのとき、success: false と NETWORK を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await addFavorite('J001246910', 5)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({}, { status: 401 })
      }),
    )

    const result = await addFavorite('J001246910', 5)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('認証が必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
