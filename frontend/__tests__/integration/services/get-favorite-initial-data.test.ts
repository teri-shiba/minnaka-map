import { checkFavoriteStatus } from '~/services/check-favorite-status'
import { decodeToken } from '~/services/decode-token'
import { getFavoriteInitialData } from '~/services/get-favorite-initial-data'

vi.mock('~/services/check-favorite-status')
vi.mock('~/services/decode-token')

describe('getFavoriteInitialData', () => {
  const mockAuth = {
    accessToken: 'token-123',
    client: 'client-123',
    uid: 'uid-123',
  }
  const mockHotPepperId = 'J001246910'
  const mockSearchHistoryId = 'SH-123'
  const mockFavoriteId = 101
  const mockToken = 'TOKEN'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('認証済みのとき', () => {
    describe('token ベース', () => {
      it('デコードに成功したとき、searchHistoryId を取得し、checkFavoriteStatus を呼び出すこと', async () => {
        vi.mocked(decodeToken).mockResolvedValue({
          success: true,
          data: {
            searchHistoryId: mockSearchHistoryId,
            restaurantId: mockHotPepperId,
          },
        })

        vi.mocked(checkFavoriteStatus).mockResolvedValue({
          success: true,
          data: {
            isFavorite: false,
            favoriteId: null,
          },
        })

        const result = await getFavoriteInitialData({
          auth: mockAuth,
          hotpepperId: mockHotPepperId,
          token: mockToken,
        })

        expect(decodeToken).toHaveBeenCalledWith(mockToken)
        expect(checkFavoriteStatus).toHaveBeenCalledWith(mockHotPepperId, mockSearchHistoryId)
        expect(result).toEqual({
          resolvedHistoryId: mockSearchHistoryId,
          favoriteData: {
            isFavorite: false,
            favoriteId: null,
          },
        })
      })

      it('デコードに失敗したとき、favoriteData: null を返すこと', async () => {
        vi.mocked(decodeToken).mockResolvedValue({
          success: false,
          message: 'トークンが無効です',
          cause: 'INVALID_SIGNATURE',
        })

        const result = await getFavoriteInitialData({
          auth: mockAuth,
          hotpepperId: mockHotPepperId,
          token: mockToken,
        })

        expect(decodeToken).toHaveBeenCalledWith(mockToken)
        expect(checkFavoriteStatus).not.toHaveBeenCalled()
        expect(result).toEqual({
          resolvedHistoryId: undefined,
          favoriteData: null,
        })
      })
    })

    describe('historyId ベース', () => {
      it('お気に入りのステータスチェックに成功したとき、お気に入りのステータスを返すこと', async () => {
        vi.mocked(checkFavoriteStatus).mockResolvedValue({
          success: true,
          data: {
            isFavorite: true,
            favoriteId: mockFavoriteId,
          },
        })

        const result = await getFavoriteInitialData({
          auth: mockAuth,
          hotpepperId: mockHotPepperId,
          historyId: mockSearchHistoryId,
        })

        expect(checkFavoriteStatus).toHaveBeenCalledWith(mockHotPepperId, mockSearchHistoryId)
        expect(result).toEqual({
          resolvedHistoryId: mockSearchHistoryId,
          favoriteData: {
            isFavorite: true,
            favoriteId: mockFavoriteId,
          },
        })
      })

      it('お気に入りのステータスチェックに失敗したとき、favoriteData: null を返すこと', async () => {
        vi.mocked(checkFavoriteStatus).mockResolvedValue({
          success: false,
          message: 'サーバーエラーが発生しました',
          cause: 'SERVER_ERROR',
        })

        const result = await getFavoriteInitialData({
          auth: mockAuth,
          hotpepperId: mockHotPepperId,
          historyId: mockSearchHistoryId,
        })

        expect(result).toEqual({
          resolvedHistoryId: mockSearchHistoryId,
          favoriteData: null,
        })
      })
    })
  })

  describe('認証済みだが、token も historyId もないとき（直接アクセス）', () => {
    it('favoriteData: null を返すこと', async () => {
      const result = await getFavoriteInitialData({
        auth: mockAuth,
        hotpepperId: mockHotPepperId,
      })

      expect(decodeToken).not.toHaveBeenCalled()
      expect(checkFavoriteStatus).not.toHaveBeenCalled()
      expect(result).toEqual({
        resolvedHistoryId: undefined,
        favoriteData: null,
      })
    })
  })

  describe('未認証のとき', () => {
    it('resolvedHistoryId と favoriteData: null を返すこと', async () => {
      const result = await getFavoriteInitialData({
        auth: null,
        hotpepperId: mockHotPepperId,
        historyId: mockSearchHistoryId,
      })

      expect(result).toEqual({
        resolvedHistoryId: mockSearchHistoryId,
        favoriteData: null,
      })

      expect(checkFavoriteStatus).not.toHaveBeenCalled()
    })
  })
})
