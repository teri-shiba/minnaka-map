import { act, renderHook } from '@testing-library/react'
import { guideCarousel as data } from '~/data/guide-carousel'
import { useGuideCarousel } from '~/hooks/useGuideCarousel'

interface GuideStep {
  step: number
}

const { guideData } = vi.hoisted(() => ({ guideData: [] as GuideStep[] }))
vi.mock('~/data/guide-carousel', () => ({ guideCarousel: guideData }))

function setData(items: GuideStep[]): void {
  guideData.splice(0, data.length, ...items)
}

describe('useGuideCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllTimers()
    setData([])
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('auto advance', () => {
    it('複数ステップあるとき、3 秒ごとに次のインデックスに進む', () => {
      setData([{ step: 1 }, { step: 2 }, { step: 3 }])
      const { result } = renderHook(() => useGuideCarousel())

      expect(result.current.activeIndex).toBe(0)

      act(() => vi.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(1)

      act(() => vi.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(2)

      act(() => vi.advanceTimersByTime(3000))
      expect(result.current.activeIndex).toBe(0)
    })

    it('1件以下のときは自動進行のタイマーをセットしない', () => {
      setData([{ step: 1 }])
      renderHook(() => useGuideCarousel())

      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('cleanup', () => {
    it('アンマウント時にタイマーをクリアする', () => {
      setData([{ step: 1 }, { step: 2 }, { step: 3 }])
      const { unmount } = renderHook(() => useGuideCarousel())

      expect(vi.getTimerCount()).toBeGreaterThan(0)

      unmount()
      expect(vi.getTimerCount()).toBe(0)
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
