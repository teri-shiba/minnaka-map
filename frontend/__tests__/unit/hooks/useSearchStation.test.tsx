import { act, renderHook } from '@testing-library/react'
import useSearchStation from '~/hooks/useSearchStation'
import { createSWRCallTracker, createSWRWrapper } from '../../helpers/swr-test-helpers'

describe('useSearchStation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('有効な検索クエリが入力されたとき、駅データの配列を返す', async () => {
    const mockStations = [
      { id: 1, name: '東京' },
      { id: 2, name: '東京テレポート' },
    ]

    const wrapper = createSWRWrapper({
      mockData: { 'q=tokyo': { stations: mockStations } },
    })

    const { result } = renderHook(() => useSearchStation('tokyo'), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.stations).toEqual(mockStations)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('検索クエリが空文字列のとき、API呼び出しを行わず空の配列を返す', () => {
    const wrapper = createSWRWrapper()
    const { result } = renderHook(() => useSearchStation(''), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.stations).toEqual([])
    expect(result.current.isError).toBe(false)
  })

  it('検索クエリが空白のみのとき、API呼び出しを行わず空の配列を返す', () => {
    const wrapper = createSWRWrapper()
    const { result } = renderHook(() => useSearchStation('   '), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.stations).toEqual([])
    expect(result.current.isError).toBe(false)
  })

  it('検索クエリの前後に空白があるとき、空白を削除してから検索を行う', async () => {
    const mockStations = [{ id: 1, name: '東京' }]

    const wrapper = createSWRWrapper({
      mockData: { 'q=tokyo': { stations: mockStations } },
    })

    const { result } = renderHook(() => useSearchStation('  tokyo  '), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.stations).toEqual(mockStations)
  })

  it('API呼び出しでエラーが発生したとき、エラー状態を返し、駅データは空の配列を返す', async () => {
    const mockError = new Error('Network Error')

    const wrapper = createSWRWrapper({
      mockData: { 'q=tokyo': mockError },
    })

    const { result } = renderHook(() => useSearchStation('tokyo'), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.isError).toBeTruthy()
    expect(result.current.stations).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('検索クエリが短時間に連続して変更されたとき、最後のクエリのみで検索を行う', async () => {
    const mockStations = [{ id: 1, name: '東京' }]

    const wrapper = createSWRWrapper({
      mockData: {
        'q=to': { stations: [] },
        'q=tok': { stations: [] },
        'q=toky': { stations: [] },
        'q=tokyo': { stations: mockStations },
      },
    })

    const { result, rerender } = renderHook(
      ({ query }) => useSearchStation(query),
      {
        wrapper,
        initialProps: { query: '' },
      },
    )

    // 短時間で連続して変更
    rerender({ query: 'to' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    rerender({ query: 'toky' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    rerender({ query: 'tokyo' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.stations).toEqual(mockStations)
  })

  it('同一の検索クエリが 500ms 以内に再度実行されたとき、キャッシュを使用し fetcher を重複して行わない', async () => {
    const mockStations = [{ id: 1, name: '東京' }]

    const {
      middleware: trackingMiddleware,
      getCallCount,
    } = createSWRCallTracker(mockStations)

    const wrapper = createSWRWrapper({ middleware: trackingMiddleware })

    const { rerender } = renderHook(({ query }) => useSearchStation(query), {
      wrapper,
      initialProps: { query: 'tokyo' },
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(getCallCount()).toBe(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    rerender({ query: 'tokyo' })

    expect(getCallCount()).toBe(1)
  })
})
