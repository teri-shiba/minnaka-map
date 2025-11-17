import { http, HttpResponse } from 'msw'
import { saveSearchHistory } from '~/services/save-search-history'
import { setupAuthMock, setupUnauthorized } from '../helpers/auth-mock'
import { server } from '../setup/msw.server'

describe('saveSearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupAuthMock()
  })

  it('未認証のとき、UNAUTHORIZEDとメッセージで失敗を返す', async () => {
    setupUnauthorized()

    const result = await saveSearchHistory([1, 2])
    expect(result).toEqual({
      success: false,
      message: 'ログインが必要です',
      cause: 'UNAUTHORIZED',
    })
  })

  it('API が成功のとき、id を searchHistoryId にして success: true を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/search_histories', async ({ request }) => {
        const json = await request.json()
        expect(json).toEqual({ search_history: { station_ids: [1, 2] } })
        expect(request.headers.get('access-token')).toBe('token-123')
        expect(request.headers.get('client')).toBe('client-123')
        expect(request.headers.get('uid')).toBe('uid-123')

        return HttpResponse.json(
          { success: true, data: { id: 123 } },
          { status: 200 },
        )
      }),
    )

    const result = await saveSearchHistory([1, 2])
    expect(result).toEqual({
      success: true,
      data: { searchHistoryId: 123 },
    })
  })

  it('HTTP ステータス 400 のとき、REQUEST_FAILED と defaultMessage を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/search_histories', async () => {
        return HttpResponse.json(
          { message: 'bad request' },
          { status: 400 },
        )
      }),
    )

    const result = await saveSearchHistory([10])
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('REQUEST_FAILED')
      expect(result.message).toBe('検索履歴の保存に失敗しました')
    }
  })

  it('HTTP ステータス 422 のとき、REQUEST_FAILED と defaultMessage を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/search_histories', async () => {
        return HttpResponse.json({ message: 'invalid station' }, { status: 422 })
      }),
    )

    const result = await saveSearchHistory([9])
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('REQUEST_FAILED')
      expect(result.message).toBe('検索履歴の保存に失敗しました')
    }
  })

  it('ネットワーク例外のとき、既定メッセージで失敗を返す', async () => {
    server.use(
      http.post('http://localhost/api/v1/search_histories', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await saveSearchHistory([301, 302])
    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toBe('ネットワークエラーが発生しました')
  })
})
