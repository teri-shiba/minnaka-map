import { http, HttpResponse } from 'msw'
import { createSharedList } from '~/services/create-shared-list'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { server } from '../setup/msw.server'

vi.mock('server-only', () => ({}))
vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))
vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

describe('createSharedList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  it('シェアリスト作成に成功したとき、shareUuid と title を返す', async () => {
    server.use(
      http.post('*/api/v1/shared_favorite_lists', async () => {
        return HttpResponse.json({
          success: true,
          data: {
            share_uuid: 'abc-123',
            title: '東京・神田',
            is_existing: false,
          },
        })
      }),
    )

    const result = await createSharedList(1)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        shareUuid: 'abc-123',
        title: '東京・神田',
        isExisting: false,
      })
    }
  })

  it('既存のシェアリストがあるとき、isExisting: true を返す', async () => {
    server.use(
      http.post('*/shared_favorite_lists', async () => {
        return HttpResponse.json({
          success: true,
          data: {
            share_uuid: 'existing-123',
            title: '渋谷・新宿',
            is_existing: true,
          },
        })
      }),
    )

    const result = await createSharedList(2)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        shareUuid: 'existing-123',
        title: '渋谷・新宿',
        isExisting: true,
      })
    }
  })

  it('API が 400 エラーのとき、REQUEST_FAILED で失敗を返す', async () => {
    server.use(
      http.post('*/shared_favorite_lists', async () => {
        return HttpResponse.json({}, { status: 400 })
      }),
    )

    const result = await createSharedList(1)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('シェアリストの作成に失敗しました')
      expect(result.cause).toBe('REQUEST_FAILED')
    }
  })

  it('ネットワークエラーのとき、NETWORK で失敗を返す', async () => {
    server.use(
      http.post('*/shared_favorite_lists', async () => {
        return HttpResponse.error()
      }),
    )

    const result = await createSharedList(1)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ネットワークエラーが発生しました')
      expect(result.cause).toBe('NETWORK')
    }
  })

  it('認証情報がないとき、UNAUTHORIZED を返す', async () => {
    vi.mocked(getAuthFromCookie).mockResolvedValueOnce(null)

    const result = await createSharedList(1)

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.message).toBe('ログインが必要です')
      expect(result.cause).toBe('UNAUTHORIZED')
    }
  })
})
