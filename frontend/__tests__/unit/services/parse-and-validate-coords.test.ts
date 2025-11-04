import { redirect } from 'next/navigation'
import { JAPAN_BOUNDS } from '~/constants'
import { parseAndValidateCoords } from '~/services/parse-and-validate-coords'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

describe('parseAndValidateCoords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('正常', () => {
    it('正常な座標を返す', () => {
      const result = parseAndValidateCoords({ lat: '35.1234', lng: '139.1234' })
      expect(result).toEqual({ lat: 35.1234, lng: 139.1234 })
    })

    it('緯度の最小値と経度の最小値とき、座標オブジェクトを返す', () => {
      const result = parseAndValidateCoords({
        lat: String(JAPAN_BOUNDS.LAT_MIN),
        lng: String(JAPAN_BOUNDS.LNG_MIN),
      })

      expect(result).toEqual({
        lat: JAPAN_BOUNDS.LAT_MIN,
        lng: JAPAN_BOUNDS.LNG_MIN,
      })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('緯度の最大値と経度の最大値とき、座標オブジェクトを返す', () => {
      const result = parseAndValidateCoords({
        lat: String(JAPAN_BOUNDS.LAT_MAX),
        lng: String(JAPAN_BOUNDS.LNG_MAX),
      })

      expect(result).toEqual({
        lat: JAPAN_BOUNDS.LAT_MAX,
        lng: JAPAN_BOUNDS.LNG_MAX,
      })
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('異常: 無効な座標', () => {
    it('緯度が数値でないとき、invalid_coordinates エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: 'invalid', lng: '139.1234' })
      expect(redirect).toHaveBeenCalledWith('/?error=invalid_coordinates')
    })

    it('経度が数値でないとき、invalid_coordinates エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: '35.1234', lng: 'invalid' })
      expect(redirect).toHaveBeenCalledWith('/?error=invalid_coordinates')
    })

    it('緯度と緯度の両方が数値でないとき、invalid_coordinates エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: 'invalid', lng: 'invalid' })
      expect(redirect).toHaveBeenCalledWith('/?error=invalid_coordinates')
    })
  })

  describe('異常: 日本の範囲外', () => {
    it('緯度が最小値より小さいとき、outside_japan エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: '25.9', lng: '139.1234' })
      expect(redirect).toHaveBeenCalledWith('/?error=outside_japan')
    })

    it('緯度が最大値より大きいとき、outside_japan エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: '45.6', lng: '139.1234' })
      expect(redirect).toHaveBeenCalledWith('/?error=outside_japan')
    })

    it('経度が最小値より小さいとき、outside_japan エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: '35.1234', lng: '122.9' })
      expect(redirect).toHaveBeenCalledWith('/?error=outside_japan')
    })

    it('経度が最大値より大きいとき、outside_japan エラーでリダイレクトする', () => {
      parseAndValidateCoords({ lat: '35.1234', lng: '146.1' })
      expect(redirect).toHaveBeenCalledWith('/?error=outside_japan')
    })
  })
})
