import { http, HttpResponse } from 'msw'
import { getMidpoint } from '~/services/get-midpoint'
import { server } from '../setup/msw.server'

describe('getMidpoint', () => {
  it('正しい駅IDを渡したとき、中間地点データを返す', async () => {
    server.use(
      http.get('http://localhost/api/v1/midpoint', () => {
        return HttpResponse.json({
          data: {
            midpoint: {
              lat: '35.12345',
              lng: '139.54321',
            },
            sig: 'SIGNED',
            exp: '2025-11-05T00:00:00Z',
          },
        })
      }),
    )

    const result = await getMidpoint([1, 2, 3])

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.midpoint.lat).toBe('35.12345')
      expect(result.data.midpoint.lng).toBe('139.54321')
      expect(result.data.sig).toBe('SIGNED')
      expect(result.data.exp).toBe('2025-11-05T00:00:00Z')
    }
  })

  it('複数の駅IDを渡したとき、クエリパラメータが正しく構築される', async () => {
    let captureUrl = ''

    server.use(
      http.get('http://localhost/api/v1/midpoint', ({ request }) => {
        captureUrl = request.url
        return HttpResponse.json({
          data: {
            midpoint: {
              lat: '35.12345',
              lng: '139.54321',
            },
            sig: 'SIGNED',
            exp: 'EXPIRES',
          },
        })
      }),
    )

    await getMidpoint([10, 20, 30])

    const url = new URL(captureUrl)
    const stationIds = url.searchParams.getAll('station_ids[]')
    expect(stationIds).toEqual(['10', '20', '30'])
  })

  it('サーバーエラーが発生したとき、「サーバーエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('http://localhost/api/v1/midpoint', async () => {
      return HttpResponse.json({}, { status: 500 })
    }))

    const result = await getMidpoint([1, 2, 3])

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('サーバーエラーが発生しました')
  })

  it('ネットワークエラーが発生したとき、「ネットワークエラーが発生しました」のメッセージを投げる', async () => {
    server.use(http.get('http://localhost/api/v1/midpoint', async () => {
      return HttpResponse.error()
    }))

    const result = await getMidpoint([1, 2, 3])

    expect(result.success).toBe(false)

    if (!result.success)
      expect(result.message).toContain('ネットワークエラーが発生しました')
  })
})
