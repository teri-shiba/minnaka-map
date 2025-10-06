import { http, HttpResponse } from 'msw'
import * as apiClient from '~/services/api-client'
import { saveSearchHistory } from '~/services/save-search-history'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn().mockResolvedValue({
    accessToken: 'token-123',
    client: 'client-123',
    uid: 'uid-123',
  }),
}))

function buildHeaders() {
  const endpoint = '*/search_histories'

  return {
    success: http.post(endpoint, async ({ request }) => {
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

    appFailure: http.post(endpoint, async () => {
      return HttpResponse.json(
        { success: false, error: { message: 'invalid station' } },
        { status: 200 },
      )
    }),

    networkError: http.post(endpoint, async () => {
      return HttpResponse.error()
    }),

    badRequest: http.post(endpoint, async () => {
      return HttpResponse.json(
        { message: 'bad request' },
        { status: 400 },
      )
    }),
  }
}

describe('saveSearchHistory', () => {
  const handlers = buildHeaders()

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('API が成功のとき、id を searchHistoryId にして success: true を返す', async () => {
    server.use(handlers.success)
    const result = await saveSearchHistory([1, 2])
    expect(result).toEqual({
      success: true,
      data: { searchHistoryId: 123 },
    })
  })

  it('API が success: false を返すとき、抽出された message と cause  を持つ失敗を返す', async () => {
    server.use(handlers.appFailure)
    const result = await saveSearchHistory([9])
    expect(result).toEqual({
      success: false,
      message: 'invalid station',
      cause: 'REQUEST_FAILED',
    })
  })

  it('ネットワーク例外のとき、handleApiError に委譲され既定メッセージで失敗を返す', async () => {
    server.use(handlers.networkError)
    const spyHandle = vi.spyOn(apiClient, 'handleApiError')
    const result = await saveSearchHistory([301, 302])
    expect(spyHandle).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toBe('ネットワークエラーが発生しました')
  })

  it('HTTP ステータス 400 のとき、REQUEST_FAILED と defaultMessage を返す', async () => {
    server.use(handlers.badRequest)
    const result = await saveSearchHistory([10])
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.cause).toBe('REQUEST_FAILED')
      expect(result.message).toBe('検索履歴の保存に失敗しました')
    }
  })
})
