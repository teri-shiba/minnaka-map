import { http, HttpResponse } from 'msw'
import { server } from '../setup/msw.server'

const mockedToastError = vi.fn()
const mockedToastInfo = vi.fn()

vi.mock('~/utils/api-url', () => ({
  apiBaseHref: () => 'https://api.minnaka-map.com',
}))

vi.mock('sonner', () => ({
  toast: {
    info: (message: string) => mockedToastInfo(message),
    error: (message: string) => mockedToastError(message),
  },
}))

async function importApi() {
  vi.resetModules()
  const mod = await import('~/lib/axios-interceptor')
  return mod.default
}

describe('axios-interceptor', () => {
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

  it('HTTP 400（認証メール確認済み）のとき、「メールアドレスはすでに確認済みです」を info として表示する', async () => {
    server.use(http.patch('*/user/confirmations', () => {
      return HttpResponse.json({}, { status: 400 })
    }))
    const api = await importApi()
    await expect(api.patch('/user/confirmations')).rejects.toThrow()
    expect(mockedToastInfo).toHaveBeenCalledWith('メールアドレスはすでに確認済みです')
    expect(mockedToastError).not.toHaveBeenCalled()
  })

  it('HTTP 400 （その他）のとき、「リクエストが正しくありません」を表示する', async () => {
    server.use(http.get('*/bad-request', () => {
      return HttpResponse.json({}, { status: 400 })
    }))
    const api = await importApi()
    await expect(api.get('/bad-request')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('リクエストが正しくありません')
  })

  it('HTTP 401 のとき、「認証エラーが発生しました」を表示する', async () => {
    server.use(http.get('*/unauthorized', () => {
      return HttpResponse.json({}, { status: 401 })
    }))
    const api = await importApi()
    await expect(api.get('/unauthorized')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('認証エラーが発生しました')
  })

  it('HTTP 404 （メール認証確認リンク）のとき、「このリンクは無効です」を表示する', async () => {
    server.use(http.get('*/user/confirmations', () => {
      return HttpResponse.json({}, { status: 404 })
    }))
    const api = await importApi()
    await expect(api.get('/user/confirmations')).rejects.toThrow()
    expect(mockedToastError).toHaveBeenCalledWith('このリンクは無効です')
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
