import { http, HttpResponse } from 'msw'
import { decodeToken } from '~/services/decode-token'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { server } from '../setup/msw.server'

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

describe('decodeToken', () => {
  const mockToken = 'TOKEN'
  const mockSearchHistoryId = 'SH-123'
  const mockRestaurantId = 'J001246910'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('認証済みのとき', () => {
    beforeEach(() => {
      vi.mocked(getAuthFromCookie).mockResolvedValue({
        accessToken: 'token-123',
        client: 'client-123',
        uid: 'uid-123',
      })
    })

    it('トークンのデコードに成功したとき、searchHistoryId と restaurantId を返すこと', async () => {
      server.use(
        http.post('*/favorite_tokens/decode', async () => {
          return HttpResponse.json({
            success: true,
            data: {
              search_history_id: mockSearchHistoryId,
              restaurant_id: mockRestaurantId,
            },
          })
        }),
      )

      const result = await decodeToken(mockToken)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.searchHistoryId).toBe(mockSearchHistoryId)
        expect(result.data.restaurantId).toBe(mockRestaurantId)
      }
    })

    it('APIがエラーを返したとき、失敗を返すこと', async () => {
      server.use(
        http.post('*/favorite_tokens/decode', async () => {
          return HttpResponse.json(
            { error: 'トークンが無効です' },
            { status: 422 },
          )
        }),
      )

      const result = await decodeToken(mockToken)

      expect(result.success).toBe(false)
    })

    it('トークンの有効期限が切れているとき、失敗を返すこと', async () => {
      server.use(
        http.post('*/favorite_tokens/decode', async () => {
          return HttpResponse.json(
            { error: 'トークンの有効期限が切れています' },
            { status: 422 },
          )
        }),
      )

      const result = await decodeToken(mockToken)

      expect(result.success).toBe(false)
    })
  })

  describe('未認証のとき', () => {
    it('UNAUTHORIZED エラーを返すこと', async () => {
      vi.mocked(getAuthFromCookie).mockResolvedValue(null)

      const result = await decodeToken(mockToken)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.message).toBe('ログインが必要です')
        expect(result.cause).toBe('UNAUTHORIZED')
      }
    })
  })
})
