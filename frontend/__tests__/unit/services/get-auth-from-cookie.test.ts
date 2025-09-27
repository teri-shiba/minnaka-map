import { cookies } from 'next/headers'
import { logger } from '~/lib/logger'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'

jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('~/lib/logger', () => ({ logger: jest.fn() }))

const mockedCookies = cookies as jest.Mock

function makeCookieStore(value: string | undefined) {
  return {
    get: jest.fn(() => (value === undefined ? undefined : { value })),
  }
}
const encodeCookie = (object: unknown) => encodeURIComponent(JSON.stringify(object))

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getAuthFromCookie', () => {
  it('有効な auth_cookie が存在するとき AuthData を返す', async () => {
    const cookieValue = encodeCookie({
      'access-token': 'token',
      'client': 'client',
      'uid': 'uid',
    })
    mockedCookies.mockReturnValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toEqual({
      accessToken: 'token',
      client: 'client',
      uid: 'uid',
    })
    expect(logger).not.toHaveBeenCalled()
  })

  it('auth_cookie が未設定なら null を返す', async () => {
    mockedCookies.mockReturnValue(makeCookieStore(undefined))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).not.toHaveBeenCalled()
  })

  it('必須フィールドが欠けていれば null を返し corrupted_cookie を記録する', async () => {
    const cookieValue = encodeCookie({ client: 'client', uid: 'uid' })
    mockedCookies.mockReturnValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          component: 'getAuthFromCookie',
          error_type: 'corrupted_cookie',
        }),
        extra: expect.objectContaining({
          hasAccessToken: false,
          hasClient: true,
          hasUid: true,
        }),
      }),
    )
  })

  it('decode や parse で例外が起きたら null を返しエラーを記録する', async () => {
    const cookieValue = '%7B' // '%7B' -> '{'
    mockedCookies.mockReturnValue(makeCookieStore(cookieValue))
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { component: 'getAuthFromCookie' },
      }),
    )
  })

  it('cookies() 自体が例外を投げた場合も null を返しエラーを記録する', async () => {
    mockedCookies.mockImplementation(() => {
      throw new Error('failure')
    })
    const result = await getAuthFromCookie()

    expect(result).toBeNull()
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { component: 'getAuthFromCookie' },
      }),
    )
  })
})
