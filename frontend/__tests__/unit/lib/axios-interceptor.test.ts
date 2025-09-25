import type { AxiosRequestConfig } from 'axios'

const mockToastError = jest.fn()

jest.mock('sonner', () => ({ toast: { error: mockToastError } }))

jest.mock('~/utils/api-url', () => ({
  apiBaseHref: jest.fn(() => 'https://minnaka-map.com/api/v1'),
}))

interface InterceptorHandlers {
  onFulfilled?: (value: unknown) => unknown
  onRejected?: (error: any) => Promise<never>
}

const interceptorHandlers: InterceptorHandlers = {}

function assertHandlers(
  handlers: InterceptorHandlers,
): asserts handlers is Required<InterceptorHandlers> {
  expect(handlers.onFulfilled).toBeDefined()
  expect(handlers.onRejected).toBeDefined()
}

const createSpy = jest.fn((_config: AxiosRequestConfig) => {
  return {
    interceptors: {
      response: {
        // axios の API 名が `use` のため、ルールをこの行だけ無効化
        // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
        use: (onFulfilled: any, onRejected: any) => {
          interceptorHandlers.onFulfilled = onFulfilled
          interceptorHandlers.onRejected = onRejected
        },
      },
    },
  }
})

const isAxiosError = (error: any) => Boolean(error?.isAxiosError)

jest.mock('axios', () => ({
  default: { create: createSpy, isAxiosError },
  create: createSpy,
  isAxiosError,
}))

describe('api', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('axios.create の設定が正しい (baseURL/headers/withCredentials/timeout)', async () => {
    jest.resetModules()
    await import('~/lib/axios-interceptor')

    expect(createSpy).toHaveBeenCalledTimes(1)
    const passedConfig = createSpy.mock.calls[0][0] as AxiosRequestConfig

    expect(passedConfig).toEqual(
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

  it('成功レスポンスはそのまま返す', () => {
    const response = { data: { ok: true } }
    assertHandlers(interceptorHandlers)
    const result = interceptorHandlers.onFulfilled(response)
    expect(result).toBe(response)
  })

  describe('エラーレスポンス時のトースト表示', () => {
    const makeAxiosError = (status: number, data: any = {}) => ({
      isAxiosError: true,
      response: { status, data },
    })

    it('400:「メールアドレスはすでに確認済みです」', async () => {
      const error = makeAxiosError(400)
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(error)).rejects.toBe(error)
      expect(mockToastError).toHaveBeenCalledWith('メールアドレスはすでに確認済みです')
    })

    it('404: 「ユーザーは見つかりません」', async () => {
      const error = makeAxiosError(404)
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(error)).rejects.toBe(error)
      expect(mockToastError).toHaveBeenCalledWith('ユーザーは見つかりません')
    })

    it('401: 「認証エラーが発生しました。再ログインしてください。」', async () => {
      const error = makeAxiosError(401)
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(error)).rejects.toBe(error)
      expect(mockToastError).toHaveBeenCalledWith('認証エラーが発生しました。再ログインしてください。')
    })

    it('422: メッセージがあれば表示、なければ既定文言', async () => {
      // カスタムメッセージあり
      const withMessages = {
        isAxiosError: true,
        response: { status: 422, data: { error: { messages: '入力が不正です' } } },
      }
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(withMessages)).rejects.toBe(withMessages)
      expect(mockToastError).toHaveBeenCalledWith('入力が不正です')

      jest.clearAllMocks()

      // カスタムメッセージなし -> 既定文言
      const noMessages = {
        isAxiosError: true,
        response: { status: 422, data: { error: { } } },
      }
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(noMessages)).rejects.toBe(noMessages)
      expect(mockToastError).toHaveBeenCalledWith('バリデーションエラーです')
    })

    it('その他の HTTP エラーは「サーバーエラーが発生しました」', async () => {
      const error = makeAxiosError(500)
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(error)).rejects.toBe(error)
      expect(mockToastError).toHaveBeenCalledWith('サーバーエラーが発生しました')
    })

    it('axiosError ではない場合は「予期しないエラーが発生しました」', async () => {
      const error = new Error('error')
      assertHandlers(interceptorHandlers)
      await expect(interceptorHandlers.onRejected(error)).rejects.toBe(error)
      expect(mockToastError).toHaveBeenCalledWith('予期しないエラーが発生しました')
    })
  })
})
