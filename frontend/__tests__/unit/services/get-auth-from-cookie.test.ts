import { cookies } from 'next/headers'
import { logger } from '~/lib/logger'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

type CookieStore = Awaited<ReturnType<typeof cookies>>
const mockedCookies = vi.mocked(cookies)

function makeCookieStore(value: string | undefined): CookieStore {
  return {
    get: vi.fn((_name: string) =>
      value === undefined ? undefined : ({ value } as { value: string }),
    ),
    getAll: vi.fn(() => []),
    has: vi.fn(() => value !== undefined),
  } as unknown as CookieStore
}

function encodeCookie(object: unknown) {
  return encodeURIComponent(JSON.stringify(object))
}

describe('getAuthFromCookie', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('有効な auth_cookie が存在するとき AuthData を返す', async () => {
    const cookieValue = encodeCookie({
      'access-token': 'token',
      'client': 'client',
      'uid': 'uid',
    })
    mockedCookies.mockResolvedValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toEqual({
      accessToken: 'token',
      client: 'client',
      uid: 'uid',
    })
    expect(logger).not.toHaveBeenCalled()
  })

  it('auth_cookie が未設定なら null を返す', async () => {
    mockedCookies.mockResolvedValue(makeCookieStore(undefined))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).not.toHaveBeenCalled()
  })

  it('必須フィールドが欠けていれば null を返し corrupted_cookie を記録する', async () => {
    const cookieValue = encodeCookie({ client: 'client', uid: 'uid' })
    mockedCookies.mockResolvedValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'getAuthFromCookie',
        extra: expect.objectContaining({
          errorType: 'corrupted_cookie',
          hasAccessToken: false,
          hasClient: true,
          hasUid: true,
        }),
      }),
    )
  })

  it('decode や parse で例外が起きたら null を返しエラーを記録する', async () => {
    const cookieValue = '%7B' // '%7B' -> '{'
    mockedCookies.mockResolvedValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'getAuthFromCookie',
      }),
    )
  })

  it('cookies() 自体が例外を投げた場合も null を返しエラーを記録する', async () => {
    mockedCookies.mockRejectedValue(new Error('failure'))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'getAuthFromCookie',
      }),
    )
  })
})
