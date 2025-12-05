import { http, HttpResponse } from 'msw'
import { server } from '../setup/msw.server'

async function importAPI() {
  vi.resetModules()
  const mod = await import('~/lib/axios-interceptor')
  return mod.default
}

describe('axios-interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('HTTP 200 のとき、レスポンスをそのまま返す', async () => {
    server.use(
      http.get('http://localhost/api/v1/test', () => {
        return HttpResponse.json({ ok: true })
      }),
    )

    const api = await importAPI()
    const response = await api.get('test')

    expect(response.data).toEqual({ ok: true })
  })

  it('HTTP 400 で確認済みエラーのとき、cause が ALREADY_CONFIRMED になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({ error: 'already_confirmed' }, { status: 400 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'ALREADY_CONFIRMED' })
  })

  it('HTTP 400 （その他）のとき、cause が REQUEST_FAILED になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 400 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'REQUEST_FAILED' })
  })

  it('HTTP 401 のとき、cause が INVALID_CREDENTIALS になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 401 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'INVALID_CREDENTIALS' })
  })

  it('HTTP 403 のとき、cause が FORBIDDEN になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 403 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'FORBIDDEN' })
  })

  it('HTTP 404 で無効なトークンのとき、cause が INVALID_TOKEN になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({ error: 'invalid_token' }, { status: 404 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'INVALID_TOKEN' })
  })

  it('HTTP 404 （その他）のとき、cause が NOT_FOUND になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 404 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'NOT_FOUND' })
  })

  it('HTTP 422 でメール重複エラーのとき、cause が DUPLICATE_EMAIL になる', async () => {
    server.use(http.post('http://localhost/api/v1/test', () => {
      return HttpResponse.json({ error: 'duplicate_email' }, { status: 422 })
    }))

    const api = await importAPI()
    await expect(api.post('test', { email: 'test@example.com' }))
      .rejects
      .toMatchObject({ cause: 'DUPLICATE_EMAIL' })
  })

  it('HTTP 422 （その他）のとき、cause が REQUEST_FAILED になる', async () => {
    server.use(http.post('http://localhost/api/v1/test', () => {
      return HttpResponse.json({ error: 'other_error' }, { status: 422 })
    }))

    const api = await importAPI()
    await expect(api.post('test', { email: 'test@example.com' }))
      .rejects
      .toMatchObject({ cause: 'REQUEST_FAILED' })
  })

  it('HTTP 429 のとき、cause が RATE_LIMIT になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 429 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'RATE_LIMIT' })
  })

  it('HTTP 500 のとき、cause が SERVER_ERROR になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 500 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'SERVER_ERROR' })
  })

  it('未知のステータス（例: 418）のとき、cause が REQUEST_FAILED になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.json({}, { status: 418 })
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'REQUEST_FAILED' })
  })

  it('ネットワークエラーのとき、cause が NETWORK になる', async () => {
    server.use(http.get('http://localhost/api/v1/test', () => {
      return HttpResponse.error()
    }))

    const api = await importAPI()
    await expect(api.get('test'))
      .rejects
      .toMatchObject({ cause: 'NETWORK' })
  })
})
