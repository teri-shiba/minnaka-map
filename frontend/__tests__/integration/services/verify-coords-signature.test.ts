import { http, HttpResponse } from 'msw'
import { logger } from '~/lib/logger'
import { verifyCoordsSignature } from '~/services/verify-coords-signature'
import { server } from '../setup/msw.server'

vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

describe('verifyCoordsSignature', () => {
  const fixedNow = new Date('2025-10-06T00:00:00Z')
  const nowSec = Math.floor(fixedNow.getTime() / 1000)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('expire_at が現在時刻以下のとき、EXPIRED を返し API を呼び出さない', async () => {
    const result = await verifyCoordsSignature({
      latitude: 35.12345,
      longitude: 139.12345,
      expires_at: nowSec - 1,
    })

    expect(result).toEqual({
      success: false,
      message: 'リンクの有効期限が切れました。もう一度検索してください。',
      cause: 'EXPIRED',
    })
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(logger).not.toHaveBeenCalled()
  })

  it('HTTP 200 かつ valid = true のとき、緯度経度配列を返す', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ valid: true }, { status: 200 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.12345,
      longitude: 139.12345,
      signature: 'SIGNED',
      expires_at: nowSec + 120,
    })

    expect(result).toEqual({
      success: true,
      data: [35.12345, 139.12345],
    })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [calledArg, calledInit] = vi.mocked(globalThis.fetch).mock.calls[0] as [RequestInfo | URL, RequestInit]
    const calledUrl = calledArg instanceof URL ? calledArg : new URL(String(calledArg))

    expect(calledUrl.pathname).toBe('/api/v1/midpoint/validate')
    expect(calledUrl.searchParams.get('latitude')).toBe('35.12345')
    expect(calledUrl.searchParams.get('longitude')).toBe('139.12345')
    expect(calledUrl.searchParams.get('signature')).toBe('SIGNED')
    expect(calledUrl.searchParams.get('expiresAt')).toBe(String(nowSec + 120))

    expect(calledInit.cache).toBe('force-cache')
    expect(calledInit?.next?.revalidate).toBe(120)
    expect(logger).not.toHaveBeenCalled()
  })

  it('HTTP 200 かつ valid = false のとき、REQUEST_FAILED を返す', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ valid: false }, { status: 200 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.12345,
      longitude: 139.12345,
      signature: 'SIGNED',
      expires_at: nowSec + 60,
    })

    expect(result).toEqual({
      success: false,
      message: '座標の検証に失敗しました',
      cause: 'REQUEST_FAILED',
    })
    expect(logger).not.toHaveBeenCalled()
  })

  it('HTTP 400 のとき、INVALID_SIGNATURE を返し、logger に記録する', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ error: 'invalid' }, { status: 400 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
      signature: 'INVALID',
      expires_at: nowSec + 10,
    })

    expect(result).toEqual({
      success: false,
      message: '座標の検証に失敗しました',
      cause: 'INVALID_SIGNATURE',
    })
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'verifyCoordsSignature',
        extra: expect.objectContaining({
          latitude: 35.0,
          longitude: 139.0,
          hasSignature: true,
        }),
      }),
    )
  })

  it('HTTP 4xx のとき、REQUEST_FAILED を返し、logger に記録する', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ error: 'invalid' }, { status: 418 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
      signature: 'INVALID',
      expires_at: nowSec + 10,
    })

    expect(result).toEqual({
      success: false,
      message: '座標の検証に失敗しました',
      cause: 'REQUEST_FAILED',
    })
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'verifyCoordsSignature',
        extra: expect.objectContaining({
          latitude: 35.0,
          longitude: 139.0,
          hasSignature: true,
        }),
      }),
    )
  })

  it('HTTP 500 のとき、SERVER_ERROR を返し、logger に記録する', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ error: 'server-error' }, { status: 500 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
      expires_at: nowSec + 10,
    })

    expect(result).toEqual({
      success: false,
      message: 'サーバーエラーが発生しました',
      cause: 'SERVER_ERROR',
    })
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'verifyCoordsSignature',
        extra: expect.objectContaining({
          latitude: 35.0,
          longitude: 139.0,
          hasSignature: false,
        }),
      }),
    )
  })

  it('ネットワークエラーのとき、NETWORK を返し、logger に記録する', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.error()
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
      expires_at: nowSec + 10,
    })

    expect(result).toEqual({
      success: false,
      message: 'ネットワークエラーが発生しました',
      cause: 'NETWORK',
    })
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'verifyCoordsSignature',
        extra: expect.objectContaining({
          latitude: 35.0,
          longitude: 139.0,
          hasSignature: false,
        }),
      }),
    )
  })

  it('expires_at を指定しないとき、cache は force-cache で revalidate: 60 になる', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ valid: true }, { status: 200 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
    })

    expect(result.success).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [calledArg, calledInit] = vi.mocked(globalThis.fetch).mock.calls[0] as [RequestInfo | URL, RequestInit]
    const calledUrl = calledArg instanceof URL ? calledArg : new URL(String(calledArg))

    expect(calledUrl.searchParams.get('latitude')).toBe('35.00000')
    expect(calledUrl.searchParams.get('longitude')).toBe('139.00000')

    expect(calledInit.cache).toBe('force-cache')
    expect(calledInit?.next?.revalidate).toBe(60)
  })

  it('expires_at が十分先のとき、revalidate は上限 300 秒に丸められる', async () => {
    server.use(
      http.get('*/api/v1/midpoint/validate', () => {
        return HttpResponse.json({ valid: true }, { status: 200 })
      }),
    )

    const result = await verifyCoordsSignature({
      latitude: 35.0,
      longitude: 139.0,
      expires_at: nowSec + 300,
    })

    expect(result.success).toBe(true)
    const [, calledInit] = vi.mocked(globalThis.fetch).mock.calls[0] as [RequestInfo | URL, RequestInit]
    expect(calledInit?.next?.revalidate).toBe(300)
  })
})
