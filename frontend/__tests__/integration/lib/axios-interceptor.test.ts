import { http, HttpResponse } from 'msw'
import { server } from '../setup/msw.server'

const mockedToastError = vi.fn()
vi.mock('~/utils/api-url', () => ({
  apiBaseHref: () => 'https://api.minnaka-map.com',
}))

vi.mock('sonner', () => ({
  toast: { error: (message: string) => mockedToastError(message) },
}))

async function importApi() {
  vi.resetModules()
  const mod = await import('~/lib/axios-interceptor')
  return mod.default
}

describe('axios-interceptor（結合）', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('HTTP 200 のとき、レスポンスをそのまま返す', async () => {
    server.use(http.get('*/success', () => {
      return HttpResponse.json({ ok: true })
    }))
    const api = await importApi()
    const response = await api.get('/success')
    expect(response.data).toEqual({ ok: true })
    expect(mockedToastError).not.toHaveBeenCalled()
  })

  it('HTTP 400 のとき、「メールアドレスはすでに確認済みです」を表示する', async () => {
    server.use(http.get('*/confirmed', () => {
      return HttpResponse.json({}, { status: 400 })
    }))
    const api = await importApi()
    await expect(api.get('/confirmed')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('メールアドレスはすでに確認済みです')
  })

  it('HTTP 401 のとき、「認証エラーが発生しました。再ログインしてください。」を表示する', async () => {
    server.use(http.get('*/unauthorized', () => {
      return HttpResponse.json({}, { status: 401 })
    }))
    const api = await importApi()
    await expect(api.get('/unauthorized')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('認証エラーが発生しました。再ログインしてください。')
  })

  it('HTTP 404 のとき、「ユーザーは見つかりません」を表示する', async () => {
    server.use(http.get('*/not-found', () => {
      return HttpResponse.json({}, { status: 404 })
    }))
    const api = await importApi()
    await expect(api.get('/not-found')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('ユーザーは見つかりません')
  })

  it('HTTP 422 で指定のメッセージがあるとき、指定メッセージを表示する', async () => {
    server.use(http.get('*/unprocessable-entity', () => {
      return HttpResponse.json(
        { error: { messages: '入力が不正です' } },
        { status: 422 },
      )
    }))
    const api = await importApi()
    await expect(api.get('/unprocessable-entity')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('入力が不正です')
  })

  it('HTTP 422 で指定のメッセージがないとき、「バリデーションエラーです」を表示する', async () => {
    server.use(http.get('*/unprocessable-entity', () => {
      return HttpResponse.json(
        { error: {} },
        { status: 422 },
      )
    }))
    const api = await importApi()
    await expect(api.get('/unprocessable-entity')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('バリデーションエラーです')
  })

  it('HTTP 500 のとき、「サーバーエラーが発生しました」を表示する', async () => {
    server.use(http.get('*/server-error', () => {
      return HttpResponse.json({}, { status: 500 })
    }))
    const api = await importApi()
    await expect(api.get('/server-error')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('サーバーエラーが発生しました')
  })

  it('未知のステータス（例: 418）のとき、既定の「サーバーエラーが発生しました」を表示する', async () => {
    server.use(http.get('*/unknown-error', () => {
      return HttpResponse.json({}, { status: 418 })
    }))
    const api = await importApi()
    await expect(api.get('/unknown-error')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('サーバーエラーが発生しました')
  })

  it('ネットワークエラーのとき、「予期しないエラーが発生しました」を表示する', async () => {
    server.use(http.get('*/network-error', () => {
      return HttpResponse.error()
    }))
    const api = await importApi()
    await expect(api.get('/network-error')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('予期しないエラーが発生しました')
  })
})
