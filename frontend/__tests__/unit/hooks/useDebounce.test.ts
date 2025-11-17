import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '~/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初期レンダーでは即座に初期値を返す', () => {
    const { result } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })
    expect(result.current).toBe('a')
  })

  it('delay 経過後に新しい値へ更新される（デフォルト 300ms）', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })

    rerender({ value: 'b', delay: 300 })
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(299)) // 閾値未満
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1)) // 閾値ちょうど
    expect(result.current).toBe('b')
  })

  it('短時間で値が連続変更されたとき、最後の値だけが反映される', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })

    rerender({ value: 'b', delay: 300 })
    act(() => vi.advanceTimersByTime(100)) // 閾値未満のうちに再入力
    rerender({ value: 'c', delay: 300 })

    act(() => vi.advanceTimersByTime(299)) // 閾値未満
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1)) // 閾値到達で最終値のみ反映
    expect(result.current).toBe('c')
  })

  it('アンマウント時にタイマーをクリーンアップする（警告や更新が走らない）', () => {
    const { unmount, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })

    rerender({ value: 'b', delay: 300 })
    unmount()

    act(() => vi.advanceTimersByTime(299)) // 閾値未満（何も起きない）
    expect(() => {
      act(() => vi.advanceTimersByTime(1000)) // 進めても例外にならない
    }).not.toThrow()
  })
})
