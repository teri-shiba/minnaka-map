import { act, fireEvent, render, screen } from '@testing-library/react'
import { createSWRWrapper } from '__tests__/helpers/swr-test-helpers'
import { server } from '__tests__/integration/setup/msw.server'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import StationAutocomplete from '~/components/features/station/search/station-autocomplete'
import '@testing-library/jest-dom/vitest'

vi.mock('~/public/figure_loading_circle.svg', () => ({
  default: () => null,
}))

const STORAGE_KEY = 'recentStations'
const DEBOUNCE_MS = 300

function StationAutocompleteHarness({ excludedStations }: { excludedStations?: string[] } = {}) {
  const [value, setValue] = useState('')
  return (
    <StationAutocomplete
      value={value}
      placeholder="駅名を入力"
      onChange={newValue => setValue(newValue)}
      excludedStations={excludedStations}
    />
  )
}

describe('StationAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()

    globalThis.ResizeObserver = class ResizeObserver {
      observe() { }
      unobserve() { }
      disconnect() { }
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('検索機能', () => {
    it('検索クエリを入力したとき、デバウンス後にAPIを呼び出して候補を表示する', async () => {
      server.use(
        http.get('*/api/v1/stations', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === '東京') {
            return HttpResponse.json({
              stations: [
                { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
                { id: 2, name: '東京テレポート', latitude: '35.54321', longitude: '139.54321' },
              ],
            })
          }
          return HttpResponse.json({ stations: [] })
        }),
      )

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')
      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('駅候補')).toBeInTheDocument()
      expect(screen.getByText('東京')).toBeInTheDocument()
      expect(screen.getByText('東京テレポート')).toBeInTheDocument()
    })

    it('APIエラーが発生したとき、エラーメッセージを表示する', async () => {
      server.use(
        http.get('*/api/v1/stations', () => {
          return HttpResponse.error()
        }),
      )

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    })
  })

  describe('駅の選択', () => {
    it('候補から駅を選択したとき、onChange が呼ばれ localStorage に保存される', async () => {
      server.use(
        http.get('*/api/v1/stations', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === '東京') {
            return HttpResponse.json({
              stations: [
                { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
                { id: 2, name: '東京テレポート', latitude: '35.54321', longitude: '139.54321' },
              ],
            })
          }
          return HttpResponse.json({ stations: [] })
        }),
      )

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()

      fireEvent.click(screen.getByText('東京テレポート'))

      expect(screen.getByPlaceholderText('駅名を入力')).toHaveValue('東京テレポート')

      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBeTruthy()

      const parsed = JSON.parse(saved!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toEqual({
        id: 2,
        name: '東京テレポート',
        latitude: '35.54321',
        longitude: '139.54321',
      })
    })

    it('同じ駅を複数回選択したとき、履歴の先頭に移動する', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 2, name: '東京テレポート', latitude: '35.54321', longitude: '139.54321' },
        { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
      ]))

      server.use(
        http.get('*/api/v1/stations', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === '東京') {
            return HttpResponse.json({
              stations: [
                { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
                { id: 2, name: '東京テレポート', latitude: '35.54321', longitude: '139.54321' },
              ],
            })
          }
          return HttpResponse.json({ stations: [] })
        }),
      )

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      fireEvent.click(screen.getByText('東京'))

      const saved = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(saved!)
      expect(parsed[0].id).toBe(1)
      expect(parsed[1].id).toBe(2)
    })

    it('履歴が5件を超えたとき、古い履歴を削除する', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 2, name: '駅2', latitude: '35.2', longitude: '139.2' },
        { id: 3, name: '駅3', latitude: '35.3', longitude: '139.3' },
        { id: 4, name: '駅4', latitude: '35.4', longitude: '139.4' },
        { id: 5, name: '駅5', latitude: '35.5', longitude: '139.5' },
        { id: 6, name: '駅6', latitude: '35.6', longitude: '139.6' },
      ]))

      server.use(
        http.get('*/api/v1/stations', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === '東京') {
            return HttpResponse.json({
              stations: [
                { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
              ],
            })
          }
          return HttpResponse.json({ stations: [] })
        }),
      )

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      fireEvent.click(screen.getByText('東京'))

      const saved = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(saved!)
      expect(parsed).toHaveLength(5)
      expect(parsed[0].id).toBe(1)
      expect(parsed.some((s: any) => s.id === 6)).toBe(false)
    })
  })

  describe('検索履歴', () => {
    it('フォーカス時に入力が空のとき、過去検索履歴を表示する', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
        { id: 2, name: '新宿', latitude: '35.54321', longitude: '139.54321' },
      ]))

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)

      await act(() => {
        expect(screen.getByText('過去に検索した場所')).toBeInTheDocument()
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      expect(screen.getByText('新宿')).toBeInTheDocument()
    })

    it('過去検索履歴をクリックしたとき、onChange が呼ばれる', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
      ]))

      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')
      fireEvent.focus(input)

      await act(() => {
        expect(screen.getByText('東京')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('東京'))

      expect(screen.getByPlaceholderText('駅名を入力')).toHaveValue('東京')
    })
  })

  describe('駅の除外', () => {
    it('除外対象の駅は候補に表示しない', async () => {
      server.use(
        http.get('*/api/v1/stations', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === '東京') {
            return HttpResponse.json({
              stations: [
                { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
                { id: 2, name: '東京テレポート', latitude: '35.54321', longitude: '139.54321' },
              ],
            })
          }
          return HttpResponse.json({ stations: [] })
        }),
      )

      const wrapper = createSWRWrapper()
      render(
        <StationAutocompleteHarness
          excludedStations={['東京']}
        />,
        { wrapper },
      )

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.input(input, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.queryByText('東京')).not.toBeInTheDocument()
      expect(screen.queryByText('東京テレポート')).toBeInTheDocument()
    })

    it('除外対象の駅は過去検索履歴にも表示しない', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 1, name: '東京', latitude: '35.12345', longitude: '139.12345' },
        { id: 2, name: '新宿', latitude: '35.54321', longitude: '139.54321' },
      ]))

      const wrapper = createSWRWrapper()
      render(
        <StationAutocompleteHarness
          excludedStations={['東京']}
        />,
        { wrapper },
      )

      const input = screen.getByPlaceholderText('駅名を入力')
      fireEvent.focus(input)

      expect(screen.getByText('過去に検索した場所')).toBeInTheDocument()
      expect(screen.queryByText('東京')).not.toBeInTheDocument()
      expect(screen.getByText('新宿')).toBeInTheDocument()
    })
  })

  describe('フォーカスとブラー', () => {
    it('フォーカス時に候補リストを表示し、ブラー時に非表示にする', async () => {
      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      expect(screen.getByText('入力候補がありません')).toBeInTheDocument()

      fireEvent.blur(input)
      expect(screen.queryByText('入力候補がありません')).not.toBeInTheDocument()
    })

    it('駅を選択せずブラーしたとき、入力値をクリアする', async () => {
      const wrapper = createSWRWrapper()
      render(<StationAutocompleteHarness />, { wrapper })

      const input = screen.getByPlaceholderText('駅名を入力')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'Tab' })

      expect(screen.getByPlaceholderText('駅名を入力')).toHaveValue('')
    })
  })
})
