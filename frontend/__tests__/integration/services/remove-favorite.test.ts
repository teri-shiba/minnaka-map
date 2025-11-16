import { http, HttpResponse } from 'msw'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { removeFavorite } from '~/services/remove-favorite'
import { server } from '../setup/msw.server'

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

describe('removeFavorite', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  it('お気に入り削除に成功したとき、success: true を返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.json(null, { status: 204 })
      }),
    )

    const result = await removeFavorite(101)

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data).toEqual({ id: 101 })
  })

  it('API が 404 エラーのとき、success: false を返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.json({}, { status: 404 })
      }),
    )

    const result = await removeFavorite(101)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りが見つかりませんでした')
      expect(result.cause).toBe('NOT_FOUND')
    }
  })

  it('ネットワークエラーのとき、success: false と NETWORK を返す', async () => {
    server.use(
      http.delete('*/favorites/:id', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await removeFavorite(101)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    vi.mocked(getAuthFromCookie).mockResolvedValueOnce(null)

    const result = await removeFavorite(101)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
