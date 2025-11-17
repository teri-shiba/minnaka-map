import { http, HttpResponse } from 'msw'
import { removeFavorite } from '~/services/remove-favorite'
import { setupAuthMock, setupUnauthorized } from '../helpers/auth-mock'
import { server } from '../setup/msw.server'

describe('removeFavorite', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setupAuthMock()
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
    setupUnauthorized()

    const result = await removeFavorite(101)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
