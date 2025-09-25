import { apiUrl } from '~/utils/api-url'

describe('apiUrl(client)', () => {
  const SERVER_ORIGIN = 'https://server.minnaka-map.com'
  const CLIENT_ORIGIN = 'https://client.minnaka-map.com'

  afterEach(() => {
    delete process.env.API_BASE_URL
    delete process.env.NEXT_PUBLIC_API_BASE_URL
  })

  it('nEXT_PUBLIC_API_BASE を優先して使う', () => {
    process.env.API_BASE_URL = `${SERVER_ORIGIN}`
    process.env.NEXT_PUBLIC_API_BASE_URL = `${CLIENT_ORIGIN}`
    const url = apiUrl('/users')
    expect(url.origin + url.pathname).toBe(`${CLIENT_ORIGIN}/api/v1/users`)
  })

  it('client: 末尾スラッシュを正規化し、API_PREFIX を含む URL を返す', () => {
    (globalThis as any).window = {}
    process.env.NEXT_PUBLIC_API_BASE_URL = `${CLIENT_ORIGIN}///`

    const url = apiUrl('/users')
    expect(url.origin + url.pathname).toBe(`${CLIENT_ORIGIN}/api/v1/users`)
    expect(url.search).toBe('')
  })
})
