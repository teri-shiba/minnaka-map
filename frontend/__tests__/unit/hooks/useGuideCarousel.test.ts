import { act, renderHook } from '@testing-library/react'
import { useGuideCarousel } from '~/hooks/useGuideCarousel'

jest.mock('~/data/guide-carousel', () => {
  const guideCarousel: any[] = []
  return { guideCarousel }
})

const { guideCarousel: data }
  = jest.requireMock('~/data/guide-carousel') as { guideCarousel: any[] }

function setData(items: any[]): void {
  data.splice(0, data.length, ...items)
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllTimers()
  setData([])
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('useGuideCarousel', () => {
  describe('auto advance', () => {
    it('複数ステップあるとき、3 秒ごとに次のインデックスに進む', () => {
      setData([{ step: 1 }, { step: 2 }, { step: 3 }])
      const { result } = renderHook(() => useGuideCarousel())

      expect(result.current.activeIndex).toBe(0)

      act(() => jest.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(1)

      act(() => jest.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(2)

      act(() => jest.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(0)
    })

    it('1件以下のときは自動進行のタイマーをセットしない', () => {
      setData([{ step: 1 }])
      const spy = jest.spyOn(globalThis, 'setTimeout')
      renderHook(() => useGuideCarousel())

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('アンマウント時にタイマーをクリアする', () => {
      setData([{ step: 1 }, { step: 2 }, { step: 3 }])
      const clearSpy = jest.spyOn(globalThis, 'clearTimeout')
      const { unmount } = renderHook(() => useGuideCarousel())
      unmount()

      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('startSequenceFrom', () => {
    it('指定したインデックスから開始できる', () => {
      setData([{ step: 1 }, { step: 2 }])
      const { result } = renderHook(() => useGuideCarousel())
      act(() => result.current.startSequenceFrom(1))

      expect(result.current.activeIndex).toBe(1)
    })
  })
})
