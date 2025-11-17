import { http, HttpResponse } from 'msw'
import { issueFavoriteTokens } from '~/services/issue-favorite-tokens'
import { setupAuthMock, setupUnauthorized } from '../helpers/auth-mock'
import { server } from '../setup/msw.server'

describe('issueFavoriteTokens', () => {
  const validParams = {
    searchHistoryId: 11,
    restaurantIds: ['J001246910', 'J000021005'],
    lat: '35.12345',
    lng: '139.54321',
    sig: 'SIGNED',
    exp: '1700000000',
  }

  beforeEach(() => {
    vi.resetAllMocks()
    setupAuthMock()
  })

  it('トークン配列を正しく返すとき、success: true と tokens を返す', async () => {
    server.use(
      http.post('*/favorite_tokens/batch', async () => {
        return HttpResponse.json({ data: {
          tokens: [
            { restaurant_id: 'J001246910', favorite_token: 'token1' },
            { restaurant_id: 'J000021005', favorite_token: 'token2' },
          ],
        } })
      }),
    )

    const result = await issueFavoriteTokens(validParams)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.tokens).toHaveLength(2)
      expect(result.data.tokens[0]).toEqual({
        restaurantId: 'J001246910',
        favoriteToken: 'token1',
      })
      expect(result.data.tokens[1]).toEqual({
        restaurantId: 'J000021005',
        favoriteToken: 'token2',
      })
    }
  })

  it('空配列を正しく返すとき、success: true と空の tokens を返す', async () => {
    server.use(
      http.post('*/favorite_tokens/batch', async () => {
        return HttpResponse.json({ data: {
          tokens: [],
        } })
      }),
    )

    const emptyParams = { ...validParams, restaurantIds: [] }

    const result = await issueFavoriteTokens(emptyParams)

    expect(result.success).toBe(true)

    if (result.success)
      expect(result.data.tokens).toEqual([])
  })

  it('座標検証に失敗したとき、422 エラーを返す', async () => {
    server.use(
      http.post('*/favorite_tokens/batch', async () => {
        return HttpResponse.json(
          { error: '座標検証に失敗しました' },
          { status: 422 },
        )
      }),
    )

    const invalidParams = { ...validParams, sig: 'INVALID' }

    const result = await issueFavoriteTokens(invalidParams)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('トークンの発行に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('ネットワークエラーのとき、success: false と NETWORK を返す', async () => {
    server.use(
      http.post('*/favorite_tokens/batch', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await issueFavoriteTokens(validParams)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    setupUnauthorized()

    const result = await issueFavoriteTokens(validParams)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
