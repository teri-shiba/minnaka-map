import { http, HttpResponse } from 'msw'
import { addFavoriteByToken } from '~/services/add-favorite-by-token'
import { setupAuthMock, setupUnauthorized } from '../helpers/auth-mock'
import { server } from '../setup/msw.server'

describe('addFavoriteByToken', () => {
  const token = 'VALID_TOKEN'

  beforeEach(() => {
    vi.resetAllMocks()
    setupAuthMock()
  })

  it('お気に入り追加に成功したとき、success: true と favoriteId を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({
          success: true,
          data: { id: 101, hotpepper_id: 'J001246910' },
        })
      }),
    )

    const result = await addFavoriteByToken(token)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.favoriteId).toBe(101)
      expect(result.data.hotpepperId).toBe('J001246910')
    }
  })

  it('API が 400 エラーのとき、success: false を返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await addFavoriteByToken(token)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('トークンが無効なとき、422 エラーを返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json(
          { error: 'トークンが無効です' },
          { status: 422 },
        )
      }),
    )

    const result = await addFavoriteByToken('INVALID_TOKEN')

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('お気に入りの追加に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('トークンが期限切れのとき、422 エラーを返す', async () => {
    server.use(
      http.post('*/favorites', async () => {
        return HttpResponse.json(
          { error: 'トークンの有効期限が切れています' },
          { status: 422 },
        )
      }),
    )

    const result = await addFavoriteByToken('INVALID_TOKEN')

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

    const result = await addFavoriteByToken(token)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    setupUnauthorized()

    const result = await addFavoriteByToken(token)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
