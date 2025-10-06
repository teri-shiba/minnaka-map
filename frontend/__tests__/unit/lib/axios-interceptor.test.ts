import type { AxiosRequestConfig } from 'axios'

vi.mock('~/utils/api-url', () => ({
  apiBaseHref: () => 'https://minnaka-map.com/api/v1',
}))

const createSpy = vi.fn((_config: AxiosRequestConfig) => ({
  interceptors: { response: { use: vi.fn() } },
}))

vi.mock('axios', () => ({
  default: { create: createSpy },
  create: createSpy,
}))

describe('api（単体: 設定のみ）', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('baseURL / headers / withCredentials / timeout が設定されていること', async () => {
    await import('~/lib/axios-interceptor')

    expect(createSpy).toHaveBeenCalledTimes(1)
    const passed = createSpy.mock.calls[0][0] as AxiosRequestConfig

    expect(passed).toEqual(
      expect.objectContaining({
        baseURL: 'https://minnaka-map.com/api/v1',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }),
        withCredentials: true,
        timeout: 5000,
      }),
    )
  })
})
